import { cookieNames, userMessages } from '@/library/constants'
import { initialiseResponder } from '@/library/utilities/server'
import type { JsonData } from '@tests/types'
import { cookies } from 'next/headers'
import type { NextRequest, NextResponse } from 'next/server'

export interface SignOutPOSTresponse {
	userMessage?: typeof userMessages.serverError
	developmentMessage?: string
}

type Output = Promise<NextResponse<SignOutPOSTresponse>>

export async function POST(request: NextRequest): Output {
	const respond = initialiseResponder<SignOutPOSTresponse>()

	let _body: JsonData | undefined
	try {
		_body = await request.json()
		return respond({ status: 400, developmentMessage: 'Body should not be provided' })
	} catch {}

	try {
		const cookieStore = await cookies()
		const tokenCookie = cookieStore.get(cookieNames.token)

		if (!tokenCookie) {
			return respond({
				status: 400,
				developmentMessage: 'Token not found',
			})
		}

		cookieStore.delete(cookieNames.token)

		return respond({
			status: 200,
			developmentMessage: 'Signed out successfully',
		})
	} catch (caughtError) {
		return respond({
			body: { userMessage: userMessages.serverError },
			status: 500,
			caughtError,
		})
	}
}
