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

const routeSignature = `GET ${apiPaths.authentication.verifyToken}:`

export async function GET(request: NextRequest): Promise<NextResponse<VerifyTokenGETresponse>> {
	const cookieStore = await cookies()

	try {
		const { dangerousUser } = await checkAccess({
			request,
			requireConfirmed: false,
			requireSubscriptionOrTrial: false,
			routeSignature,
		})

		if (!dangerousUser) {
			cookieStore.delete(cookieNames.token)
			// Think about UX here...
			return NextResponse.json({ message: 'Please sign in' }, { status: 400 })
		}

		const { activeSubscriptionOrTrial, trialExpiry } = await checkActiveSubscriptionOrTrial(
			dangerousUser.id,
			dangerousUser.cachedTrialExpired,
		)

		const { userRole } = await getUserRoles(dangerousUser)

		const baseUser = sanitiseDangerousBaseUser(dangerousUser)

		const compositeUser: BrowserSafeCompositeUser = {
			...baseUser,
			roles: userRole,
			activeSubscriptionOrTrial,
			trialExpiry,
		}

		logger.success(routeSignature, 'Token validated successfully')
		return NextResponse.json({ user: compositeUser }, { status: 200 })
	} catch (error) {
		logger.error(routeSignature, error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
