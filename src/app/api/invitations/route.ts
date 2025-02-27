import {
	apiPaths,
	authenticationMessages,
	basicMessages,
	durationSettings,
	httpStatus,
	missingFieldMessages,
	tokenMessages,
} from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkActiveSubscriptionOrTrial, checkRelationship, checkUserExists } from '@/library/database/operations'
import { invitations, users } from '@/library/database/schema'
import { sendEmail } from '@/library/email/sendEmail'
import { createExistingUserInvitation } from '@/library/email/templates/invitations/existingUser'
import { createNewUserInvitation } from '@/library/email/templates/invitations/newUser'
import { emailRegex } from '@/library/email/utilities'
import logger from '@/library/logger'
import { obfuscateEmail } from '@/library/utilities'
import { createInvitationURL } from '@/library/utilities/definitions/createInvitationURL'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import type { BrowserSafeInvitationRecord, DangerousBaseUser, Invitation, InvitationInsert, TokenMessages } from '@/types'
import { and, eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { v4 as generateConfirmationToken } from 'uuid'

type TransactionErrorMessage =
	| 'error deleting expired invitation'
	| 'error creating new invitation'
	| typeof basicMessages.errorSendingEmail

export interface InviteCustomerPOSTresponse {
	message:
		| TokenMessages
		| TransactionErrorMessage
		| typeof basicMessages.success
		| typeof basicMessages.serverError
		| typeof basicMessages.unknownTransactionError
		| typeof authenticationMessages.invalidEmailFormat
		| typeof authenticationMessages.emailNotConfirmed
		| typeof authenticationMessages.noActiveTrialSubscription
		| typeof missingFieldMessages.invitedEmailMissing
		| 'attempted to invite self'
		| 'relationship exists'
		| 'in-date invitation exists'
	browserSafeInvitationRecord?: BrowserSafeInvitationRecord
}

export interface InviteCustomerPOSTbody {
	invitedEmail: string
}

// Create an invitation
export async function POST(request: NextRequest): Promise<NextResponse<InviteCustomerPOSTresponse>> {
	try {
		const { invitedEmail }: InviteCustomerPOSTbody = await request.json()

		// 1. Check the email has been provided
		if (!invitedEmail) {
			return NextResponse.json({ message: missingFieldMessages.invitedEmailMissing }, { status: httpStatus.http400badRequest })
		}

		// 2. Normalise email
		const normalisedInvitedEmail = invitedEmail.trim().toLowerCase()

		// 3. Check email format
		if (!emailRegex.test(normalisedInvitedEmail)) {
			return NextResponse.json({ message: authenticationMessages.invalidEmailFormat }, { status: httpStatus.http400badRequest })
		}

		// 4. Check for valid token
		const { extractedUserId, status, message } = await extractIdFromRequestCookie(request)
		if (!extractedUserId) {
			return NextResponse.json({ message }, { status })
		}

		// 5. Check user exists and emailConfirmed
		const { userExists, existingDangerousUser } = await checkUserExists(extractedUserId)

		if (!userExists || !existingDangerousUser) {
			return NextResponse.json({ message: tokenMessages.userNotFound }, { status: httpStatus.http401unauthorised })
		}

		if (!existingDangerousUser.emailConfirmed) {
			return NextResponse.json({ message: authenticationMessages.emailNotConfirmed }, { status: httpStatus.http401unauthorised })
		}

		if (existingDangerousUser.email === normalisedInvitedEmail) {
			return NextResponse.json({ message: 'attempted to invite self' }, { status: httpStatus.http400badRequest })
		}

		// 6. Check user has an active subscription or trial
		const { activeSubscriptionOrTrial } = await checkActiveSubscriptionOrTrial(extractedUserId, existingDangerousUser.cachedTrialExpired)

		if (!activeSubscriptionOrTrial) {
			return NextResponse.json({ message: authenticationMessages.noActiveTrialSubscription }, { status: httpStatus.http401unauthorised })
		}

		// 7. Check if invitee already has an account
		const [inviteeWithAccountAlready]: DangerousBaseUser[] = await database
			.select()
			.from(users)
			.where(eq(users.email, normalisedInvitedEmail))
			.limit(1)

		if (inviteeWithAccountAlready) {
			// 8. If so, look for an existing relationship
			const { relationshipExists } = await checkRelationship({
				merchantId: extractedUserId,
				customerId: inviteeWithAccountAlready.id,
			})

			if (relationshipExists) {
				return NextResponse.json({ message: 'relationship exists' }, { status: httpStatus.http202accepted })
			}
		}

		// 9. Check for an existing invitation
		const [existingInvitation]: Invitation[] = await database
			.select()
			.from(invitations)
			.where(and(eq(invitations.senderUserId, extractedUserId), eq(invitations.email, normalisedInvitedEmail)))

		logger.debug('Existing invitation: ', existingInvitation)

		// 10. Check existing invitation expiry
		const inDateInvitationExists = existingInvitation && existingInvitation.expiresAt > new Date()

		if (inDateInvitationExists) {
			const regeneratedUrlForLogger = createInvitationURL(existingInvitation.token)
			logger.info('Regenerated in-date invitation: ', regeneratedUrlForLogger)

			return NextResponse.json({ message: 'in-date invitation exists' }, { status: httpStatus.http400badRequest })
		}

		const newInvitationExpiryDate = new Date(Date.now() + durationSettings.acceptInvitationExpiry)

		let transactionErrorMessage: TransactionErrorMessage | undefined = 'error deleting expired invitation'
		let transactionErrorCode: number | undefined = httpStatus.http503serviceUnavailable

		const { newInvitation } = await database.transaction(async (tx) => {
			// Enhancement ToDo:
			// 8. Transaction: Delete expired invitation if it exists
			// tx.delete(invitations).where(and(eq(invitations.senderUserId, extractedUserId), eq(invitations.email, normalisedInvitedEmail)))

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

			// 10. Generate the invitation link
			const invitationURL = createInvitationURL(newInvitation.token)
			logger.info('Invitation url: ', invitationURL)

			// 11. Transaction: send the invitation email if it isn't a test address
			transactionErrorMessage = basicMessages.errorSendingEmail
			const dynamicEmailTemplate = inviteeWithAccountAlready
				? createExistingUserInvitation({
						recipientEmail: normalisedInvitedEmail,
						merchantBusinessName: existingDangerousUser.businessName,
						invitationURL,
						expiryDate: newInvitationExpiryDate,
					})
				: createNewUserInvitation({
						recipientEmail: normalisedInvitedEmail,
						merchantBusinessName: existingDangerousUser.businessName,
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
			return { newInvitation }
		})

		if (transactionErrorMessage || transactionErrorCode) {
			return NextResponse.json(
				{ message: transactionErrorMessage || basicMessages.unknownTransactionError },
				{ status: transactionErrorCode || 503 },
			)
		}

		// 12. Return browser-safe details
		const browserSafeInvitationRecord: BrowserSafeInvitationRecord = {
			obfuscatedEmail: obfuscateEmail(normalisedInvitedEmail),
			expirationDate: newInvitationExpiryDate,
			lastEmailSentDate: newInvitation.lastEmailSent,
		}

		return NextResponse.json({ message: basicMessages.success, browserSafeInvitationRecord }, { status: httpStatus.http200ok })
	} catch (error) {
		logger.error(`POST ${apiPaths.invitations.base} error: `, error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
