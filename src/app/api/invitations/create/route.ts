import { apiPaths, authenticationMessages, basicMessages, durationSettings, httpStatus } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkActiveSubscriptionOrTrial, checkUserExists } from '@/library/database/operations'
import { customerToMerchant, invitations, users } from '@/library/database/schema'
import { sendEmail } from '@/library/email/sendEmail'
import { createExistingUserInvitation } from '@/library/email/templates/invitations/existingUser'
import { createNewUserInvitation } from '@/library/email/templates/invitations/newUser'
import { emailRegex } from '@/library/email/utilities'
import { dynamicBaseURL } from '@/library/environment/publicVariables'
import logger from '@/library/logger'
import { obfuscateEmail } from '@/library/utilities'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import type {
	AuthenticationMessages,
	BasicMessages,
	BrowserSafeInvitationRecord,
	CustomerToMerchant,
	DangerousBaseUser,
	Invitation,
	InvitationInsert,
} from '@/types'
import { and, eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import urlJoin from 'url-join'
import { v4 as generateConfirmationToken } from 'uuid'

export interface InviteCustomerPOSTresponse {
	message:
		| BasicMessages
		| AuthenticationMessages
		| 'invitedEmail missing'
		| 'invalid email'
		| 'attempted to invite self'
		| 'relationship exists'
		| 'in-date invitation exists'
	browserSafeInvitationRecord?: BrowserSafeInvitationRecord
}

export interface InviteCustomerPOSTbody {
	invitedEmail: string
}

export async function POST(request: NextRequest): Promise<NextResponse<InviteCustomerPOSTresponse>> {
	try {
		const { invitedEmail }: InviteCustomerPOSTbody = await request.json()

		// 1. Check the email has been provided
		if (!invitedEmail) {
			return NextResponse.json({ message: 'invitedEmail missing' }, { status: 400 })
		}

		// 2. Normalise email
		const normalisedInvitedEmail = invitedEmail.trim().toLowerCase()

		// 3. Check email format
		if (!emailRegex.test(normalisedInvitedEmail)) {
			return NextResponse.json({ message: 'invalid email' }, { status: 400 })
		}

		// 4. Check for valid token
		const { extractedUserId, status, message } = extractIdFromRequestCookie(request)
		if (!extractedUserId) {
			return NextResponse.json({ message }, { status })
		}

		// 5. Check user exists and emailConfirmed
		const { userExists, existingUser } = await checkUserExists(extractedUserId)

		logger.debug('User exists:', userExists)
		logger.debug('Existing user details:', existingUser)

		if (!userExists || !existingUser) {
			return NextResponse.json({ message: authenticationMessages.userNotFound }, { status: httpStatus.http401unauthorised })
		}

		logger.debug('Email is confirmed: ', existingUser.emailConfirmed)

		if (!existingUser.emailConfirmed) {
			return NextResponse.json({ message: authenticationMessages.emailNotConfirmed }, { status: httpStatus.http401unauthorised })
		}

		if (existingUser.email === normalisedInvitedEmail) {
			return NextResponse.json({ message: 'attempted to invite self' }, { status: 400 })
		}

		// 6. Check user has an active subscription or trial
		const { validSubscriptionOrTrial } = await checkActiveSubscriptionOrTrial(extractedUserId, existingUser.cachedTrialExpired)

		logger.debug('Valid subscription or trial: ', validSubscriptionOrTrial)

		if (!validSubscriptionOrTrial) {
			return NextResponse.json({ message: authenticationMessages.noActiveTrialSubscription }, { status: httpStatus.http401unauthorised })
		}

		// 7. Check if invitee already has an account
		const [inviteeAlreadyHasAccount]: DangerousBaseUser[] = await database
			.select()
			.from(users)
			.where(eq(users.email, normalisedInvitedEmail))
			.limit(1)

		if (inviteeAlreadyHasAccount) {
			// 8. If so, look for an existing relationship
			const [existingRelationship]: CustomerToMerchant[] = await database
				.select()
				.from(customerToMerchant)
				.where(
					and(eq(customerToMerchant.merchantUserId, extractedUserId), eq(customerToMerchant.customerUserId, inviteeAlreadyHasAccount.id)),
				)
			if (existingRelationship) {
				return NextResponse.json({ message: 'relationship exists' }, { status: httpStatus.http202accepted })
			}
		}

		// 9. Check for an existing invitation
		const [existingInvitation]: Invitation[] = await database
			.select()
			.from(invitations)
			.where(and(eq(invitations.senderUserId, extractedUserId), eq(invitations.email, normalisedInvitedEmail)))

		let expiredInvitation: Invitation | null
		if (existingInvitation) {
			// 10. Check existing invitation expiry
			expiredInvitation = existingInvitation.expiresAt < new Date() ? existingInvitation : null
			if (!expiredInvitation) {
				// An in-date invitation already exists, so early return to prevent merchants from spamming potential customers
				return NextResponse.json({ message: 'in-date invitation exists' }, { status: 400 })
			}
		}

		let transactionErrorMessage = undefined
		let transactionErrorCode: number | undefined = httpStatus.http503serviceUnavailable

		const newInvitationExpiryDate = new Date(Date.now() + durationSettings.acceptInvitationExpiry)

		logger.debug('About to start transaction')
		await database.transaction(async (tx) => {
			logger.debug('Inside transaction')
			if (expiredInvitation) {
				transactionErrorMessage = 'error deleting expired invitation'
				// 8. Transaction: Delete expired invitation if it exists
				tx.delete(invitations).where(and(eq(invitations.senderUserId, extractedUserId), eq(invitations.email, normalisedInvitedEmail)))
			}

			// 9. Transaction: create a new invitation row
			const invitationInsert: InvitationInsert = {
				email: normalisedInvitedEmail,
				senderUserId: extractedUserId,
				token: generateConfirmationToken(),
				expiresAt: newInvitationExpiryDate,
				lastEmailSent: new Date(),
				emailAttempts: 1,
			}
			transactionErrorMessage = 'error creating new invitation'
			const [newInvitation]: Invitation[] = await tx.insert(invitations).values(invitationInsert).returning()

			// 10. Generate the invitation link.
			const invitationURL = urlJoin(
				dynamicBaseURL,
				// Remember this is a link to the front-end, which then passes the token to the server
				'accept-invitation',
				newInvitation.token,
			)

			logger.info('Invitation url: ', invitationURL)

			// 11. Transaction: send the invitation email if it isn't a test address
			transactionErrorMessage = authenticationMessages.errorSendingEmail
			const dynamicEmailTemplate = inviteeAlreadyHasAccount
				? createExistingUserInvitation({
						recipientEmail: normalisedInvitedEmail,
						merchantBusinessName: existingUser.businessName,
						invitationURL,
						expiryDate: newInvitationExpiryDate,
					})
				: createNewUserInvitation({
						recipientEmail: normalisedInvitedEmail,
						merchantBusinessName: existingUser.businessName,
						invitationURL,
						expiryDate: newInvitationExpiryDate,
					})

			const sentEmailSuccessfully = await sendEmail({
				recipientEmail: normalisedInvitedEmail,
				...dynamicEmailTemplate,
			})
			if (!sentEmailSuccessfully) tx.rollback()
			transactionErrorMessage = undefined
			transactionErrorCode = undefined
		})

		if (transactionErrorMessage || transactionErrorCode) {
			return NextResponse.json({ message: transactionErrorMessage || 'unknown transaction error' }, { status: transactionErrorCode || 503 })
		}

		// 12. Return browser-safe details
		const browserSafeInvitationRecord: BrowserSafeInvitationRecord = {
			obfuscatedEmail: obfuscateEmail(normalisedInvitedEmail),
			expirationDate: newInvitationExpiryDate,
		}

		return NextResponse.json({ message: basicMessages.success, browserSafeInvitationRecord }, { status: httpStatus.http200ok })
	} catch (error) {
		logger.error(`${apiPaths.invitations.create} error: `, error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
