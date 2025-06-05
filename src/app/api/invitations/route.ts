import { http202accepted, userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkAccess, checkRelationship } from '@/library/database/operations'
import { invitations, users } from '@/library/database/schema'
import { sendEmail } from '@/library/email/sendEmail'
import { createExistingUserInvitation, createNewUserInvitation } from '@/library/email/templates'
import logger from '@/library/logger'
import { emailRegex, emptyToUndefined, invitationExpiryDate, obfuscateEmail } from '@/library/utilities/public'
import { and, createInvitation, createInvitationURL, equals, inArray, initialiseResponder } from '@/library/utilities/server'
import type { BrowserSafeInvitationReceived, BrowserSafeInvitationSent, DangerousBaseUser, Invitation, UserMessages } from '@/types'
import type { NextRequest, NextResponse } from 'next/server'

export interface InvitationsGETresponse {
	userMessage?: UserMessages
	invitationsSent?: BrowserSafeInvitationSent[]
	invitationsReceived?: BrowserSafeInvitationReceived[]
}

type OutputGET = Promise<NextResponse<InvitationsGETresponse>>

// ToDo: refactor with responder function and split into multiple files
export async function GET(request: NextRequest): OutputGET {
	const respond = initialiseResponder<InvitationsGETresponse>()
	try {
		const { dangerousUser, accessDenied } = await checkAccess({
			request,
			requireConfirmed: false,
			requireSubscriptionOrTrial: false,
		})

		if (accessDenied) {
			return respond({
				status: accessDenied.status,
				developmentMessage: accessDenied.message,
			})
		}

		const rawInvitationsReceived = emptyToUndefined(
			await database.select().from(invitations).where(equals(invitations.email, dangerousUser.email)),
		)

		const rawInvitationsSent = emptyToUndefined(
			await database.select().from(invitations).where(equals(invitations.senderUserId, dangerousUser.id)),
		)

		if (!rawInvitationsReceived && !rawInvitationsSent) {
			return respond({
				status: 200,
				developmentMessage: 'legitimately no invitations found',
			})
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

			// ToDo: Possible UTC/Timezone issues here
		}

		const invitationsSent: BrowserSafeInvitationSent[] | undefined = rawInvitationsSent
			? rawInvitationsSent.map((invitation) => ({
					obfuscatedEmail: obfuscateEmail(invitation.email),
					lastEmailSentDate: invitation.lastEmailSent,
					expirationDate: invitation.expiresAt,
				}))
			: undefined

		return respond({
			body: { invitationsReceived, invitationsSent },
			status: 200,
		})
	} catch (caughtError) {
		return respond({
			body: { userMessage: userMessages.serverError },
			status: 500,
			caughtError,
		})
	}
}

export interface InvitationsPOSTresponse {
	userMessage?: typeof userMessages.serverError
	developerMessage?: string
	browserSafeInvitationRecord?: BrowserSafeInvitationSent
}

export interface InvitationsPOSTbody {
	invitedEmail: string
}

type OutputPOST = Promise<NextResponse<InvitationsPOSTresponse>>

// Create an invitation
export async function POST(request: NextRequest): OutputPOST {
	const respond = initialiseResponder<InvitationsPOSTresponse>()
	try {
		const { invitedEmail }: InvitationsPOSTbody = await request.json()

		if (!invitedEmail) {
			return respond({
				status: 400,
				developmentMessage: 'invitedEmail missing',
			})
		}

		const normalisedInvitedEmail = invitedEmail.trim().toLowerCase()

		if (!emailRegex.test(normalisedInvitedEmail)) {
			return respond({
				status: 400,
				developmentMessage: 'invalid email format',
			})
		}

		const { dangerousUser, accessDenied } = await checkAccess({
			request,
			requireConfirmed: true,
			requireSubscriptionOrTrial: true,
		})

		if (accessDenied) {
			return respond({
				status: accessDenied.status,
				developmentMessage: accessDenied.message,
			})
		}

		if (dangerousUser.email === normalisedInvitedEmail) {
			return respond({
				status: 400,
				developmentMessage: 'attempted to invite self',
			})
		}

		const [inviteeWithAccountAlready]: DangerousBaseUser[] | undefined = await database
			.select()
			.from(users)
			.where(equals(users.email, normalisedInvitedEmail))
			.limit(1)

		if (inviteeWithAccountAlready) {
			const { relationshipExists } = await checkRelationship({
				merchantId: dangerousUser.id,
				customerId: inviteeWithAccountAlready.id,
			})

			if (relationshipExists) {
				return respond({
					status: http202accepted,
					developmentMessage: 'relationship exists',
				})
			}
		}

		const [existingInvitation]: Invitation[] | undefined = await database
			.select()
			.from(invitations)
			.where(and(equals(invitations.senderUserId, dangerousUser.id), equals(invitations.email, normalisedInvitedEmail)))

		const inDateInvitationExists = existingInvitation && existingInvitation.expiresAt > new Date()

		if (inDateInvitationExists) {
			logger.info(
				'Regenerated in-date invitation: ', //
				createInvitationURL(existingInvitation.token),
			)

			return respond({
				status: 400,
				developmentMessage: 'in-date invitation exists',
			})
		}

		const newInvitationExpiryDate = invitationExpiryDate()

		let txError: { message: string; status: number } | undefined = { message: 'unknown transaction error', status: 503 }

		const { lastEmailSent } = await database.transaction(async (tx) => {
			txError = { message: 'error creating new invitation', status: 503 }
			const { invitationURL, lastEmailSent, newInvitationExpiryDate } = await createInvitation({
				senderUserId: dangerousUser.id,
				recipientEmail: normalisedInvitedEmail,
				tx,
			})

			txError.message = 'error sending email'
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
			txError = undefined
			return { lastEmailSent }
		})

		if (txError) {
			return respond({
				status: txError.status,
				developmentMessage: txError.message,
			})
		}

		const browserSafeInvitationRecord: BrowserSafeInvitationSent = {
			obfuscatedEmail: obfuscateEmail(normalisedInvitedEmail),
			expirationDate: newInvitationExpiryDate,
			lastEmailSentDate: lastEmailSent,
		}

		return respond({
			body: { browserSafeInvitationRecord },
			status: 200,
		})
	} catch (caughtError) {
		return respond({
			body: { userMessage: userMessages.serverError },
			status: 500,
			caughtError,
		})
	}
}
