import { userMessages } from '@/library/constants'
import { checkAccess, getRelationshipsOld } from '@/library/database/operations'
import { initialiseResponder } from '@/library/utilities/server'
import type { ApiResponse, UserContextType, UserMessages } from '@/types'
import type { NextRequest, NextResponse } from 'next/server'

type Success = {
	ok: true
} & Pick<UserContextType, 'confirmedCustomers' | 'confirmedMerchants'>

type Failure = {
	ok: false
	userMessage: UserMessages
}

export type RelationshipsGETresponse = ApiResponse<Success, Failure>

// GET confirmed customers & merchants for the signed-in user
export async function GET(request: NextRequest): Promise<NextResponse<RelationshipsGETresponse>> {
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

		const { confirmedCustomers, confirmedMerchants } = await getRelationshipsOld(dangerousUser.id)

		if (!confirmedCustomers && !confirmedMerchants) {
			return respond({
				body: { confirmedCustomers: null, confirmedMerchants: null },
				status: 200,
				developmentMessage: 'Legitimately no relationships',
			})
		}

		return respond({
			body: { confirmedCustomers, confirmedMerchants },
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
