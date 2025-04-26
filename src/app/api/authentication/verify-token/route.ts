import { cookieNames, userMessages } from '@/library/constants'
import { checkAccess, checkActiveSubscriptionOrTrial, getUserRoles } from '@/library/database/operations'
import { sanitiseDangerousBaseUser } from '@/library/utilities/public'
import { initialiseResponder } from '@/library/utilities/server'
import type { BrowserSafeCompositeUser, UserMessages } from '@/types'
import { cookies } from 'next/headers'
import type { NextRequest, NextResponse } from 'next/server'

export interface VerifyTokenGETresponse {
	developmentMessage?: string
	userMessage?: UserMessages
	user?: BrowserSafeCompositeUser
}

type Output = Promise<NextResponse<VerifyTokenGETresponse>>

export async function GET(request: NextRequest): Output {
	const respond = initialiseResponder<VerifyTokenGETresponse>()

	const cookieStore = await cookies()

	try {
		const { dangerousUser } = await checkAccess({
			request,
			requireConfirmed: false,
			requireSubscriptionOrTrial: false,
		})

		if (!dangerousUser) {
			cookieStore.delete(cookieNames.token)
			return respond({
				status: 400,
				developmentMessage: 'User not found',
			})
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

		return respond({
			body: { user: compositeUser },
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
