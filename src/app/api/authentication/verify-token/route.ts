import { apiPaths, basicMessages, cookieNames, httpStatus } from '@/library/constants'
import { checkAccess, checkActiveSubscriptionOrTrial, getUserRoles } from '@/library/database/operations'
import logger from '@/library/logger'
import { sanitiseDangerousBaseUser } from '@/library/utilities/public'
import type { BrowserSafeCompositeUser } from '@/types'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

export interface VerifyTokenGETresponse {
	message?: string
	user?: BrowserSafeCompositeUser
}

const routeDetail = `GET ${apiPaths.authentication.verifyToken}:`

export async function GET(request: NextRequest): Promise<NextResponse<VerifyTokenGETresponse>> {
	const cookieStore = await cookies()

	try {
		const { foundDangerousUser } = await checkAccess({
			request,
			requireConfirmed: false,
			requireSubscriptionOrTrial: false,
			routeDetail,
		})

		if (!foundDangerousUser) {
			cookieStore.delete(cookieNames.token)
			return NextResponse.json({ message: 'Please sign in' }, { status: 400 })
		}

		const { activeSubscriptionOrTrial } = await checkActiveSubscriptionOrTrial(foundDangerousUser.id, foundDangerousUser.cachedTrialExpired)

		const { userRole } = await getUserRoles(foundDangerousUser)

		const baseUser = sanitiseDangerousBaseUser(foundDangerousUser)

		const compositeUser: BrowserSafeCompositeUser = {
			...baseUser,
			roles: userRole,
			activeSubscriptionOrTrial,
		}

		logger.success(routeDetail, 'Token validated successfully')
		return NextResponse.json({ user: compositeUser }, { status: httpStatus.http200ok })
	} catch (error) {
		logger.error(routeDetail, error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
