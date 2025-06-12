import { userMessages } from '@/library/constants'
import { checkAccess, getInvitationRecords } from '@/library/database/operations'
import { getUsers } from '@/library/database/operations/definitions/getUsers'
import { initialiseResponder, mapInvitations, mapUserIds } from '@/library/utilities/server'
import type { ApiResponse, BrowserSafeInvitationReceived, BrowserSafeInvitationSent, NonEmptyArray } from '@/types'
import type { NextRequest, NextResponse } from 'next/server'

type Success = {
	ok: true
	invitationsSent: NonEmptyArray<BrowserSafeInvitationSent> | null
	invitationsReceived: NonEmptyArray<BrowserSafeInvitationReceived> | null
}

type Failure = {
	ok: false
	userMessage: (typeof userMessages)['authenticationError' | 'serverError']
}

export type InvitationsGETresponse = ApiResponse<Success, Failure>

type OutputGET = Promise<NextResponse<InvitationsGETresponse>>

export async function GET(request: NextRequest): OutputGET {
	const respond = initialiseResponder<Success, Failure>()
	try {
		const { dangerousUser, accessDenied } = await checkAccess({
			request,
			requireConfirmed: false,
			requireSubscriptionOrTrial: false,
		})

		if (accessDenied) {
			return respond({
				body: { userMessage: userMessages.authenticationError },
				status: accessDenied.status,
				developmentMessage: accessDenied.message,
			})
		}

		const invitationRecords = await getInvitationRecords(dangerousUser)

		if (!invitationRecords) {
			return respond({
				body: {
					invitationsReceived: null,
					invitationsSent: null,
				},
				status: 200,
				developmentMessage: 'legitimately no invitations found',
			})
		}

		const merchantProfileIds = mapUserIds({
			dangerousUser, //
			invitationRecords,
			relationshipRecords: null,
		})

		const merchantProfiles = await getUsers(merchantProfileIds)

		const { invitationsReceived, invitationsSent } = mapInvitations({
			dangerousUser,
			invitationRecords,
			profiles: merchantProfiles,
		})

		return respond({
			body: {
				invitationsReceived,
				invitationsSent,
			},
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
