import { cookieNames, userMessages } from '@/library/constants'
import { checkAccess, getUserData } from '@/library/database/operations'
import { initialiseResponderNew } from '@/library/utilities/server'
import type { ApiResponse, UserData, UserMessages } from '@/types'
import { cookies } from 'next/headers'
import type { NextRequest, NextResponse } from 'next/server'

type Success = {
	ok: true
	userData?: UserData
}

type Failure = {
	ok: false
	userMessage: UserMessages
	developmentMessage?: string
}

export type VerifyTokenGETresponse = ApiResponse<Success, Failure>
type Output = Promise<NextResponse<VerifyTokenGETresponse>>

/**
 * Checks if the user is signed in. IF they are, it gets all their data, if not, it just gets their preferred currency
 */
export async function GET(request: NextRequest): Output {
	const respond = initialiseResponderNew<Success, Failure>()

	try {
		const cookieStore = await cookies()
		const tokenCookie = cookieStore.get(cookieNames.token)

		if (!tokenCookie) {
			return respond({
				body: {}, // Allow new site visitors
				status: 200,
				developmentMessage: 'Not signed in',
			})
		}

		const { dangerousUser } = await checkAccess({
			request,
			requireConfirmed: false,
			requireSubscriptionOrTrial: false,
		})

		if (!dangerousUser) {
			cookieStore.delete(cookieNames.token)
			return respond({
				body: { userMessage: userMessages.authenticationError },
				status: 400,
				developmentMessage: 'User not found',
			})
		}

		const userData = await getUserData(dangerousUser)

		return respond({
			body: { userData },
			status: 200,
			developmentMessage: 'Token validated successfully',
		})
	} catch (caughtError) {
		return respond({
			body: { userMessage: userMessages.serverError },
			status: 500,
			caughtError,
		})
	}
}
