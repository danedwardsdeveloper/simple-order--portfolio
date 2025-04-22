import { apiPaths, cookieNames, userMessages } from '@/library/constants'
import { checkAccess, checkActiveSubscriptionOrTrial, getUserRoles } from '@/library/database/operations'
import logger from '@/library/logger'
import { initialiseDevelopmentLogger, sanitiseDangerousBaseUser } from '@/library/utilities/public'
import type { BrowserSafeCompositeUser, UserMessages } from '@/types'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

export interface VerifyTokenGETresponse {
	developmentMessage?: string
	userMessage?: UserMessages
	user?: BrowserSafeCompositeUser
}

export async function GET(request: NextRequest): Promise<NextResponse<VerifyTokenGETresponse>> {
	const routeSignature = `GET ${apiPaths.authentication.verifyToken}:`
	const developmentLogger = initialiseDevelopmentLogger(routeSignature)
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
			const developmentMessage = developmentLogger('User not found')
			return NextResponse.json({ developmentMessage }, { status: 400 })
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
		return NextResponse.json({ userMessage: userMessages.serverError }, { status: 500 })
	}
}
