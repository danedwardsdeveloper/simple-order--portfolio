import { apiPaths, authenticationMessages, basicMessages, httpStatus } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkMerchantProfileExists, getInventory } from '@/library/database/operations'
import { invitations, users } from '@/library/database/schema'
import logger from '@/library/logger'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import type { AuthenticationMessages, BaseBrowserSafeUser, BasicMessages, FullBrowserSafeUser, Invitation } from '@/types'
import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'

export interface VerifyTokenGETresponse {
	message: BasicMessages | AuthenticationMessages
	fullBrowserSafeUser?: FullBrowserSafeUser
}

export async function GET(request: NextRequest): Promise<NextResponse<VerifyTokenGETresponse>> {
	try {
		const { extractedUserId, status, message } = extractIdFromRequestCookie(request)

		if (!extractedUserId) {
			return NextResponse.json({ message }, { status })
		}

		const [foundBaseUser]: BaseBrowserSafeUser[] = await database
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

		if (!foundBaseUser) {
			return NextResponse.json({ message: authenticationMessages.userNotFound }, { status: httpStatus.http401unauthorised })
		}

		let fullBrowserSafeUser: FullBrowserSafeUser = foundBaseUser

		logger.debug('Full browser-safe user: ', fullBrowserSafeUser)

		const { merchantProfileExists, slug } = await checkMerchantProfileExists(extractedUserId)

		if (merchantProfileExists && slug) {
			const inventory = await getInventory(extractedUserId)

			const pendingInvitations: Invitation[] = await database
				.select()
				.from(invitations)
				.where(eq(invitations.senderUserId, extractedUserId))

			logger.debug('Pending invitations: ', pendingInvitations)

			if (inventory) {
				fullBrowserSafeUser = {
					...foundBaseUser,
					merchantDetails: {
						slug,
						freeTrial: {
							endDate: new Date(), // ToDo: fix this!
						},
						customersAsMerchant: [],
					},
					inventory,
				}
			}
		}

		// Add merchant details, get orders etc. and transform user

		logger.debug('Full browser-safe user: ', JSON.stringify(fullBrowserSafeUser))

		return NextResponse.json({ message: basicMessages.success, fullBrowserSafeUser }, { status: httpStatus.http200ok })
	} catch (error) {
		logger.error(`${apiPaths.authentication.verifyToken} error: `, error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
