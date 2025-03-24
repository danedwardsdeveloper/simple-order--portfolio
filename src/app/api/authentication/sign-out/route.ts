import { apiPaths, basicMessages, cookieNames, httpStatus, tokenMessages } from '@/library/constants'
import logger from '@/library/logger'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export interface SignOutPOSTresponse {
	message: typeof basicMessages.success | typeof basicMessages.serverError | typeof tokenMessages.tokenMissing
}

export async function POST(): Promise<NextResponse<SignOutPOSTresponse>> {
	try {
		const cookieStore = await cookies()
		const tokenCookie = cookieStore.get(cookieNames.token)

		if (!tokenCookie) {
			return NextResponse.json({ message: tokenMessages.tokenMissing }, { status: httpStatus.http400badRequest })
		}

		cookieStore.delete(cookieNames.token)

		return NextResponse.json({ message: basicMessages.success }, { status: 200 })
	} catch (error) {
		logger.error(`${apiPaths.authentication.signOut} error: `, error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
