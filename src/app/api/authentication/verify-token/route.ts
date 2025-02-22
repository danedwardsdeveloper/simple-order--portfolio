import { apiPaths, authenticationMessages, basicMessages, httpStatus } from '@/library/constants'
import { database } from '@/library/database/connection'
import { users } from '@/library/database/schema'
import logger from '@/library/logger'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import type { AuthenticationMessages, BaseBrowserSafeUser, BasicMessages, FullBrowserSafeUser } from '@/types'
import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'

export interface VerifyTokenGETresponse {
	message: BasicMessages | AuthenticationMessages
	browserSafeUser?: FullBrowserSafeUser
}

export async function GET(request: NextRequest): Promise<NextResponse<VerifyTokenGETresponse>> {
	try {
		const { extractedUserId, status, message } = await extractIdFromRequestCookie(request)

		if (!extractedUserId) {
			return NextResponse.json({ message }, { status })
		}

		const [browserSafeUser]: BaseBrowserSafeUser[] = await database
			.select({
				firstName: users.firstName,
				lastName: users.lastName,
				email: users.email,
				businessName: users.businessName,
				emailConfirmed: users.emailConfirmed,
				cachedTrialExpired: users.cachedTrialExpired,
			})
			.from(users)
			.where(eq(users.id, extractedUserId))

		if (!browserSafeUser) {
			return NextResponse.json({ message: authenticationMessages.userNotFound }, { status: httpStatus.http401unauthorised })
		}

		return NextResponse.json({ message: basicMessages.success, browserSafeUser }, { status: httpStatus.http200ok })
	} catch (error) {
		logger.error(`${apiPaths.authentication.verifyToken} error: `, error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
