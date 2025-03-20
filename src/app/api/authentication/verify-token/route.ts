import { apiPaths, basicMessages, cookieNames, httpStatus, tokenMessages } from '@/library/constants'
import { checkActiveSubscriptionOrTrial, checkUserExists, getUserRoles } from '@/library/database/operations'
import logger from '@/library/logger'
import { sanitiseDangerousBaseUser } from '@/library/utilities/public'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import type { BrowserSafeCompositeUser, UnauthorisedMessages } from '@/types'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

export interface VerifyTokenGETresponse {
	message: typeof basicMessages.success | typeof basicMessages.serverError | UnauthorisedMessages
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

		const { userExists, existingDangerousUser } = await checkUserExists(extractedUserId)

		if (!userExists) {
			logger.info(routeDetail, "User doesn't exist")
			cookieStore.delete(cookieNames.token)
			return NextResponse.json({ message: tokenMessages.userNotFound }, { status: httpStatus.http401unauthorised })
		}

		if (!existingDangerousUser) {
			logger.info(routeDetail, 'User not found')
			cookieStore.delete(cookieNames.token)
			return NextResponse.json({ message: tokenMessages.userNotFound }, { status: httpStatus.http401unauthorised })
		}

		const { activeSubscriptionOrTrial } = await checkActiveSubscriptionOrTrial(extractedUserId, existingDangerousUser.cachedTrialExpired)

		const { userRole } = await getUserRoles(existingDangerousUser)

		const baseUser = sanitiseDangerousBaseUser(existingDangerousUser)

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
