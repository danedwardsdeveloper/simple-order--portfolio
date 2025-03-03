import { apiPaths, basicMessages, httpStatus, tokenMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkActiveSubscriptionOrTrial, checkUserExists, getUserRoles } from '@/library/database/operations'
import { users } from '@/library/database/schema'
import logger from '@/library/logger'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import type { BaseBrowserSafeUser, BrowserSafeCompositeUser, TokenMessages } from '@/types'
import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'

export interface VerifyTokenGETresponse {
	message: typeof basicMessages.success | typeof basicMessages.serverError | TokenMessages
	user?: BrowserSafeCompositeUser
}

export async function GET(request: NextRequest): Promise<NextResponse<VerifyTokenGETresponse>> {
	try {
		const { extractedUserId, status, message } = await extractIdFromRequestCookie(request)

		if (!extractedUserId) {
			return NextResponse.json({ message }, { status })
		}

		const { userExists } = await checkUserExists(extractedUserId)
		if (!userExists) {
			return NextResponse.json({ message: tokenMessages.userNotFound }, { status: httpStatus.http401unauthorised })
		}

		const [baseUser]: BaseBrowserSafeUser[] = await database
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

		if (!baseUser) {
			return NextResponse.json({ message: tokenMessages.userNotFound }, { status: httpStatus.http401unauthorised })
		}

		// If they have confirmed merchants they are a customer
		// If they have a merchant profile they are a merchant

		const { activeSubscriptionOrTrial } = await checkActiveSubscriptionOrTrial(extractedUserId, baseUser.cachedTrialExpired)

		const { userRole } = await getUserRoles(extractedUserId)

		const compositeUser: BrowserSafeCompositeUser = {
			...baseUser,
			roles: userRole,
			accountActive: activeSubscriptionOrTrial,
		}

		logger.debug('Composite user: ', compositeUser)

		return NextResponse.json({ message: basicMessages.success, user: compositeUser }, { status: httpStatus.http200ok })
	} catch (error) {
		logger.error(`${apiPaths.authentication.verifyToken} error: `, error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
