import { apiPaths, cookieNames, httpStatus, userMessages } from '@/library/constants'
import { initialiseDevelopmentLogger } from '@/library/utilities/public'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export interface SignOutPOSTresponse {
	userMessage?: typeof userMessages.serverError
	developmentMessage?: string
}

export async function POST(): Promise<NextResponse<SignOutPOSTresponse>> {
	const developmentLogger = initialiseDevelopmentLogger(`POST ${apiPaths.authentication.signOut}: `)

	try {
		const cookieStore = await cookies()
		const tokenCookie = cookieStore.get(cookieNames.token)

		if (!tokenCookie) {
			const developmentMessage = developmentLogger('token not found')
			return NextResponse.json({ developmentMessage }, { status: httpStatus.http400badRequest })
		}

		/* ToDo 
		- Don't use cookies() as it doesn't work in testing
		- Delete Stripe cookies too
		*/

		cookieStore.delete(cookieNames.token)

		const developmentMessage = developmentLogger('Signed out successfully', undefined, 'level3success')
		return NextResponse.json({ developmentMessage }, { status: 200 })
	} catch (error) {
		const developmentMessage = developmentLogger('Caught error', error)
		return NextResponse.json({ userMessage: userMessages.serverError, developmentMessage }, { status: 500 })
	}
}
