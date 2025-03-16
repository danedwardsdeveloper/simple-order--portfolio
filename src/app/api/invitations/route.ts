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
import { convertEmptyToUndefined, obfuscateEmail } from '@/library/utilities'
import { createInvitationURL } from '@/library/utilities/definitions/createInvitationURL'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import type {
	BrowserSafeInvitationReceived,
	BrowserSafeInvitationSent,
	DangerousBaseUser,
	Invitation,
	InvitationInsert,
	UnauthorisedMessages,
} from '@/types'
import { and, eq, inArray } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { v4 as generateConfirmationToken } from 'uuid'

type TransactionErrorMessage =
	| 'error deleting expired invitation'
	| 'error creating new invitation'
	| typeof basicMessages.errorSendingEmail

export interface InvitationsPOSTresponse {
	message:
		| UnauthorisedMessages
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
	browserSafeInvitationRecord?: BrowserSafeInvitationSent
}

export interface InvitationsPOSTbody {
	invitedEmail: string
}

// Create an invitation
export async function POST(request: NextRequest): Promise<NextResponse<InvitationsPOSTresponse>> {
	try {
		const { invitedEmail }: InvitationsPOSTbody = await request.json()
		if (!invitedEmail) {
			return NextResponse.json({ message: missingFieldMessages.invitedEmailMissing }, { status: httpStatus.http400badRequest })
		}

		const normalisedInvitedEmail = invitedEmail.trim().toLowerCase()
		if (!emailRegex.test(normalisedInvitedEmail)) {
			return NextResponse.json({ message: authenticationMessages.invalidEmailFormat }, { status: httpStatus.http400badRequest })
		}

		const { extractedUserId, status, message } = await extractIdFromRequestCookie(request)
		if (!extractedUserId) {
			return NextResponse.json({ message }, { status })
		}

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

		const { activeSubscriptionOrTrial } = await checkActiveSubscriptionOrTrial(extractedUserId, existingDangerousUser.cachedTrialExpired)

		if (!activeSubscriptionOrTrial) {
			return NextResponse.json({ message: authenticationMessages.noActiveTrialSubscription }, { status: httpStatus.http401unauthorised })
		}

		const [inviteeWithAccountAlready]: DangerousBaseUser[] | undefined = await database
			.select()
			.from(users)
			.where(eq(users.email, normalisedInvitedEmail))
			.limit(1)

		if (inviteeWithAccountAlready) {
			const { relationshipExists } = await checkRelationship({
				merchantId: extractedUserId,
				customerId: inviteeWithAccountAlready.id,
			})

			if (relationshipExists) {
				return NextResponse.json({ message: 'relationship exists' }, { status: httpStatus.http202accepted })
			}
		}

		const [existingInvitation]: Invitation[] | undefined = await database
			.select()
			.from(invitations)
			.where(and(eq(invitations.senderUserId, extractedUserId), eq(invitations.email, normalisedInvitedEmail)))

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

			const invitationURL = createInvitationURL(newInvitation.token)
			logger.info('Invitation url: ', invitationURL)

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

		const browserSafeInvitationRecord: BrowserSafeInvitationSent = {
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

export interface InvitationsGETresponse {
	message: UnauthorisedMessages | typeof basicMessages.serverError | typeof basicMessages.success | 'no invitations found'
	invitationsSent?: BrowserSafeInvitationSent[]
	invitationsReceived?: BrowserSafeInvitationReceived[]
}

const routeDetailsGET = `GET ${apiPaths.invitations.base}: `

export async function GET(request: NextRequest): Promise<NextResponse<InvitationsGETresponse>> {
	try {
		const { extractedUserId, status, message } = await extractIdFromRequestCookie(request)

		if (!extractedUserId) {
			logger.warn(routeDetailsGET, "Couldn't extract user ID from cookie")
			return NextResponse.json({ message }, { status })
		}

		const { existingDangerousUser } = await checkUserExists(extractedUserId)
		if (!existingDangerousUser) {
			logger.warn(routeDetailsGET, 'user not found')
			return NextResponse.json({ message: tokenMessages.userNotFound }, { status: httpStatus.http401unauthorised })
		}

		const rawInvitationsReceived = convertEmptyToUndefined(
			await database.select().from(invitations).where(eq(invitations.email, existingDangerousUser.email)),
		)

		const rawInvitationsSent = convertEmptyToUndefined(
			await database.select().from(invitations).where(eq(invitations.senderUserId, existingDangerousUser.id)),
		)

		if (!rawInvitationsReceived && !rawInvitationsSent) {
			logger.info(routeDetailsGET, 'legitimately no invitations found')
			return NextResponse.json({ message: 'no invitations found' }, { status: httpStatus.http200ok })
		}

		let invitationsReceived: BrowserSafeInvitationReceived[] | undefined
		if (rawInvitationsReceived) {
			const senderUserIds = rawInvitationsReceived.map((invitation) => invitation.senderUserId)

			const merchantBusinessNames = await database
				.select({
					id: users.id,
					businessName: users.businessName,
				})
				.from(users)
				.where(inArray(users.id, senderUserIds))

			const businessNameMap = new Map(merchantBusinessNames.map((merchant) => [merchant.id, merchant.businessName]))

			invitationsReceived = rawInvitationsReceived.map((invitation) => ({
				merchantBusinessName: businessNameMap.get(invitation.senderUserId) || 'Unknown Business',
				expirationDate: invitation.expiresAt || new Date(),
			}))
		}

		const invitationsSent: BrowserSafeInvitationSent[] | undefined = rawInvitationsSent
			? rawInvitationsSent.map((invitation) => ({
					obfuscatedEmail: obfuscateEmail(invitation.email),
					lastEmailSentDate: invitation.lastEmailSent,
					expirationDate: invitation.expiresAt,
				}))
			: undefined

		return NextResponse.json({ message: basicMessages.success, invitationsReceived, invitationsSent }, { status: httpStatus.http200ok })
	} catch (error) {
		logger.error(`GET ${apiPaths.invitations.base} error: `, error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
