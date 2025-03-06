import { apiPaths, basicMessages, cookieNames, httpStatus, tokenMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkActiveSubscriptionOrTrial, checkUserExists, getUserRoles } from '@/library/database/operations'
import { users } from '@/library/database/schema'
import logger from '@/library/logger'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import type { BaseBrowserSafeUser, BrowserSafeCompositeUser, TokenMessages } from '@/types'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

export interface VerifyTokenGETresponse {
	message: typeof basicMessages.success | typeof basicMessages.serverError | TokenMessages
	user?: BrowserSafeCompositeUser
}

const routeDetail = `GET ${apiPaths.authentication.verifyToken}:`

export async function GET(request: NextRequest): Promise<NextResponse<VerifyTokenGETresponse>> {
	const cookieStore = await cookies()

	try {
		const { extractedUserId, status, message } = await extractIdFromRequestCookie(request)

		if (message === 'token missing') {
			logger.info(routeDetail, 'No token provided')
			cookieStore.delete(cookieNames.token)
			return NextResponse.json({ message }, { status })
		}

		if (!extractedUserId) {
			logger.info(routeDetail, "Couldn't extract user ID")
			cookieStore.delete(cookieNames.token)
			return NextResponse.json({ message }, { status })
		}

		const { userExists } = await checkUserExists(extractedUserId)
		if (!userExists) {
			logger.info(routeDetail, "User doesn't exist")
			cookieStore.delete(cookieNames.token)
			return NextResponse.json({ message: tokenMessages.userNotFound }, { status: httpStatus.http401unauthorised })
		}

		const [baseUser]: BaseBrowserSafeUser[] = await database
			.select({
				firstName: users.firstName,
				lastName: users.lastName,
				email: users.email,
				slug: users.slug,
				businessName: users.businessName,
				emailConfirmed: users.emailConfirmed,
				cachedTrialExpired: users.cachedTrialExpired,
			})
			.from(users)
			.where(eq(users.id, extractedUserId))

		if (!baseUser) {
			logger.info(routeDetail, 'User not found')
			cookieStore.delete(cookieNames.token)
			return NextResponse.json({ message: tokenMessages.userNotFound }, { status: httpStatus.http401unauthorised })
		}

		const { activeSubscriptionOrTrial } = await checkActiveSubscriptionOrTrial(extractedUserId, baseUser.cachedTrialExpired)

		const { userRole } = await getUserRoles(extractedUserId)

		const compositeUser: BrowserSafeCompositeUser = {
			...baseUser,
			roles: userRole,
			activeSubscriptionOrTrial,
		}

		logger.info(routeDetail, 'Token validated successfully')
		return NextResponse.json({ message: basicMessages.success, user: compositeUser }, { status: httpStatus.http200ok })
	} catch (error) {
		logger.error(routeDetail, error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
