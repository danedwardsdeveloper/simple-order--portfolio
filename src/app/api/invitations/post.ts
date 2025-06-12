import { http409conflict, userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkAccess, checkRelationship } from '@/library/database/operations'
import { invitations, users } from '@/library/database/schema'
import { sendEmail } from '@/library/email/sendEmail'
import ExistingCustomerInvitationTemplate, {
	existingCustomerSubject,
} from '@/library/email/templates/definitions/ExistingCustomerInvitationTemplate'
import NewCustomerInvitationTemplate from '@/library/email/templates/definitions/NewCustomerInvitationTemplate'
import logger from '@/library/logger'
import { emailRegex, invitationExpiryDate, obfuscateEmail } from '@/library/utilities/public'
import { and, createInvitation, createInvitationURL, equals, initialiseResponder } from '@/library/utilities/server'
import type { ApiResponse, BrowserSafeInvitationSent, DangerousBaseUser, Invitation } from '@/types'
import type { NextRequest, NextResponse } from 'next/server'

type Success = {
	ok: true
	browserSafeInvitationRecord?: BrowserSafeInvitationSent
}

type Failure = {
	ok: false
	userMessage: (typeof userMessages)['serverError' | 'unexpectedError' | 'authenticationError' | 'relationshipExists' | 'databaseError']
}

export type InvitationsPOSTresponse = ApiResponse<Success, Failure>

export interface InvitationsPOSTbody {
	invitedEmail: string
}

type OutputPOST = Promise<NextResponse<InvitationsPOSTresponse>>

// Create an invitation
export async function POST(request: NextRequest): OutputPOST {
	const respond = initialiseResponder<Success, Failure>()
	try {
		const { invitedEmail }: InvitationsPOSTbody = await request.json()

		if (!invitedEmail) {
			return respond({
				body: { userMessage: userMessages.unexpectedError },
				status: 400,
				developmentMessage: 'invitedEmail missing',
			})
		}

		const normalisedInvitedEmail = invitedEmail.trim().toLowerCase()

		if (!emailRegex.test(normalisedInvitedEmail)) {
			return respond({
				body: { userMessage: userMessages.unexpectedError },
				status: 400,
				developmentMessage: 'invalid email format',
			})
		}

		const { dangerousUser: merchantDetails, accessDenied } = await checkAccess({
			request,
			requireConfirmed: true,
			requireSubscriptionOrTrial: true,
		})

		if (accessDenied) {
			return respond({
				body: { userMessage: userMessages.authenticationError },
				status: accessDenied.status,
				developmentMessage: accessDenied.message,
			})
		}

		if (merchantDetails.email === normalisedInvitedEmail) {
			return respond({
				body: { userMessage: userMessages.unexpectedError },
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
				merchantId: merchantDetails.id,
				customerId: inviteeWithAccountAlready.id,
			})

			if (relationshipExists) {
				return respond({
					body: { userMessage: userMessages.relationshipExists },
					status: http409conflict,
					developmentMessage: 'relationship already exists',
				})
			}
		}

		const [existingInvitation]: Invitation[] | undefined = await database
			.select()
			.from(invitations)
			.where(and(equals(invitations.senderUserId, merchantDetails.id), equals(invitations.email, normalisedInvitedEmail)))

		const inDateInvitationExists = existingInvitation && existingInvitation.expiresAt > new Date()

		if (inDateInvitationExists) {
			logger.info(
				'Regenerated in-date invitation: ', //
				createInvitationURL(existingInvitation.token),
			)

			return respond({
				body: { userMessage: userMessages.unexpectedError },
				status: 400,
				developmentMessage: 'in-date invitation exists',
			})
		}

		const invitationExpiry = invitationExpiryDate()

		let txError: { message: string; status: number } | undefined = { message: 'unknown transaction error', status: 503 }

		const { lastEmailSent } = await database.transaction(async (tx) => {
			txError = { message: 'error creating new invitation', status: 503 }
			const { invitationUrl, lastEmailSent, invitationExpiry } = await createInvitation({
				senderUserId: merchantDetails.id,
				recipientEmail: normalisedInvitedEmail,
				tx,
			})

			txError.message = 'error sending email'

			if (inviteeWithAccountAlready) {
				await sendEmail({
					template: ExistingCustomerInvitationTemplate,
					templateProps: {
						recipientFirstName: inviteeWithAccountAlready.firstName,
						merchantFirstName: merchantDetails.firstName,
						merchantBusinessName: merchantDetails.businessName,
						invitationUrl,
						invitationExpiry: invitationExpiry,
					},
					recipient: normalisedInvitedEmail,
					subject: existingCustomerSubject(merchantDetails.firstName),
				})
			} else {
				await sendEmail({
					template: NewCustomerInvitationTemplate,
					templateProps: {
						recipientEmail: normalisedInvitedEmail,
						merchantFirstName: merchantDetails.firstName,
						merchantBusinessName: merchantDetails.businessName,
						invitationUrl,
						invitationExpiry: invitationExpiry,
					},
					recipient: normalisedInvitedEmail,
					subject: existingCustomerSubject(merchantDetails.firstName), // ToDo!
				})
			}

			txError = undefined
			return { lastEmailSent }
		})

		if (txError) {
			return respond({
				body: { userMessage: userMessages.databaseError },
				status: txError.status,
				developmentMessage: txError.message,
			})
		}

		const browserSafeInvitationRecord: BrowserSafeInvitationSent = {
			obfuscatedEmail: obfuscateEmail(normalisedInvitedEmail),
			expirationDate: invitationExpiry,
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
