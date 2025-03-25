import { apiPaths, basicMessages, durationSettings, httpStatus, userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkAccess, checkRelationship } from '@/library/database/operations'
import { invitations, users } from '@/library/database/schema'
import { sendEmail } from '@/library/email/sendEmail'
import { createExistingUserInvitation, createNewUserInvitation } from '@/library/email/templates'
import logger from '@/library/logger'
import {
	convertEmptyToUndefined,
	emailRegex,
	generateUuid,
	logAndSanitiseApiError,
	logAndSanitiseApiResponse,
	obfuscateEmail,
} from '@/library/utilities/public'
import { createInvitationURL } from '@/library/utilities/public'
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

type TransactionErrorMessage =
	| 'error deleting expired invitation'
	| 'error creating new invitation'
	| typeof basicMessages.errorSendingEmail

export interface InvitationsPOSTresponse {
	userMessage?: string
	developerMessage?: string
	browserSafeInvitationRecord?: BrowserSafeInvitationSent
}

export interface InvitationsPOSTbody {
	invitedEmail: string
}

const routeDetailPOST = `POST ${apiPaths.invitations.base}`

// Create an invitation
export async function POST(request: NextRequest): Promise<NextResponse<InvitationsPOSTresponse>> {
	try {
		const { invitedEmail }: InvitationsPOSTbody = await request.json()

		if (!invitedEmail) {
			const developerMessage = logAndSanitiseApiResponse({
				routeDetail: routeDetailPOST,
				message: 'invitedEmail missing',
			})
			return NextResponse.json({ developerMessage }, { status: 400 })
		}

		const normalisedInvitedEmail = invitedEmail.trim().toLowerCase()

		if (!emailRegex.test(normalisedInvitedEmail)) {
			const developerMessage = logAndSanitiseApiResponse({
				routeDetail: routeDetailPOST,
				message: 'invalid email format',
			})
			return NextResponse.json({ developerMessage }, { status: 400 })
		}

		const { dangerousUser } = await checkAccess({
			request,
			routeDetail: routeDetailPOST,
			requireConfirmed: true,
			requireSubscriptionOrTrial: true,
		})

		if (!dangerousUser) {
			return NextResponse.json({}, { status: 400 })
		}

		if (dangerousUser.email === normalisedInvitedEmail) {
			return NextResponse.json({ developerMessage: 'attempted to invite self' }, { status: 400 })
		}

		const [inviteeWithAccountAlready]: DangerousBaseUser[] | undefined = await database
			.select()
			.from(users)
			.where(eq(users.email, normalisedInvitedEmail))
			.limit(1)

		if (inviteeWithAccountAlready) {
			const { relationshipExists } = await checkRelationship({
				merchantId: dangerousUser.id,
				customerId: inviteeWithAccountAlready.id,
			})

			if (relationshipExists) {
				return NextResponse.json({ developerMessage: 'relationship exists' }, { status: httpStatus.http202accepted })
			}
		}

		const [existingInvitation]: Invitation[] | undefined = await database
			.select()
			.from(invitations)
			.where(and(eq(invitations.senderUserId, dangerousUser.id), eq(invitations.email, normalisedInvitedEmail)))

		const inDateInvitationExists = existingInvitation && existingInvitation.expiresAt > new Date()

		if (inDateInvitationExists) {
			const regeneratedUrlForLogger = createInvitationURL(existingInvitation.token)
			logger.info('Regenerated in-date invitation: ', regeneratedUrlForLogger)

			return NextResponse.json({ developerMessage: 'in-date invitation exists' }, { status: 400 })
		}

		const newInvitationExpiryDate = new Date(Date.now() + durationSettings.acceptInvitationExpiry)

		let transactionErrorMessage: TransactionErrorMessage | undefined = 'error deleting expired invitation'
		let transactionErrorCode: number | undefined = httpStatus.http503serviceUnavailable

		const { newInvitation } = await database.transaction(async (tx) => {
			// 9. Transaction: create a new invitation row
			const invitationInsert: InvitationInsert = {
				email: normalisedInvitedEmail,
				senderUserId: dangerousUser.id,
				token: generateUuid(),
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
						merchantBusinessName: dangerousUser.businessName,
						invitationURL,
						expiryDate: newInvitationExpiryDate,
					})
				: createNewUserInvitation({
						recipientEmail: normalisedInvitedEmail,
						merchantBusinessName: dangerousUser.businessName,
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
				{ developerMessage: transactionErrorMessage || basicMessages.unknownTransactionError },
				{ status: transactionErrorCode || 503 },
			)
		}

		const browserSafeInvitationRecord: BrowserSafeInvitationSent = {
			obfuscatedEmail: obfuscateEmail(normalisedInvitedEmail),
			expirationDate: newInvitationExpiryDate,
			lastEmailSentDate: newInvitation.lastEmailSent,
		}

		return NextResponse.json({ browserSafeInvitationRecord }, { status: 200 })
	} catch (error) {
		logAndSanitiseApiError({ routeDetail: routeDetailPOST, error })
		return NextResponse.json({ userMessage: userMessages.serverError }, { status: 500 })
	}
}

export interface InvitationsGETresponse {
	message?: UnauthorisedMessages | typeof basicMessages.serverError | typeof basicMessages.success | 'no invitations found'
	invitationsSent?: BrowserSafeInvitationSent[]
	invitationsReceived?: BrowserSafeInvitationReceived[]
}

const routeDetailsGET = `GET ${apiPaths.invitations.base}: `

export async function GET(request: NextRequest): Promise<NextResponse<InvitationsGETresponse>> {
	try {
		const { dangerousUser } = await checkAccess({
			request,
			routeDetail: routeDetailsGET,
			requireConfirmed: false,
			requireSubscriptionOrTrial: false,
		})

		if (!dangerousUser) {
			return NextResponse.json({}, { status: 400 })
		}

		const rawInvitationsReceived = convertEmptyToUndefined(
			await database.select().from(invitations).where(eq(invitations.email, dangerousUser.email)),
		)

		const rawInvitationsSent = convertEmptyToUndefined(
			await database.select().from(invitations).where(eq(invitations.senderUserId, dangerousUser.id)),
		)

		if (!rawInvitationsReceived && !rawInvitationsSent) {
			logger.info(routeDetailsGET, 'legitimately no invitations found')
			return NextResponse.json({ message: 'no invitations found' }, { status: 200 })
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

		return NextResponse.json({ message: basicMessages.success, invitationsReceived, invitationsSent }, { status: 200 })
	} catch (error) {
		logger.error(`GET ${apiPaths.invitations.base} error: `, error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: 500 })
	}
}

// Was 266 lines before refactor
