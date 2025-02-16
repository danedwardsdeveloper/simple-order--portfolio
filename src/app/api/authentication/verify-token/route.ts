import { eq as equals } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'

import { database } from '@/library/database/connection'
import { checkMerchantProfileExists, getInventory } from '@/library/database/operations'
import { users } from '@/library/database/schema'
import logger from '@/library/logger'
import { extractIdFromRequestCookie } from '@/library/utilities/server'

import {
	type AuthenticationMessages,
	type BaseBrowserSafeUser,
	type BasicMessages,
	type FullBrowserSafeUser,
	authenticationMessages,
	basicMessages,
	httpStatus,
} from '@/types'

export interface VerifyTokenGETresponse {
	message: BasicMessages | AuthenticationMessages
	user?: FullBrowserSafeUser
}

export async function GET(request: NextRequest): Promise<NextResponse<VerifyTokenGETresponse>> {
	try {
		const { extractedUserId, status, message } = extractIdFromRequestCookie(request)

		if (!extractedUserId) {
			return NextResponse.json({ message }, { status })
		}

		const [foundUser]: BaseBrowserSafeUser[] = await database
			.select({
				firstName: users.firstName,
				lastName: users.lastName,
				email: users.email,
				businessName: users.businessName,
				emailConfirmed: users.emailConfirmed,
				cachedTrialExpired: users.cachedTrialExpired,
			})
			.from(users)
			.where(equals(users.id, extractedUserId))

		if (!foundUser) {
			return NextResponse.json({ message: authenticationMessages.userNotFound }, { status: httpStatus.http401unauthorised })
		}

		let clientSafeUser: FullBrowserSafeUser = {
			...foundUser,
		}

		const { merchantProfileExists, slug } = await checkMerchantProfileExists(extractedUserId)
		if (merchantProfileExists) {
			const inventory = await getInventory(extractedUserId)

			if (inventory) {
				clientSafeUser = {
					...foundUser,
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

		logger.debug('Full browser-safe user: ', JSON.stringify(clientSafeUser))

		return NextResponse.json({ message: basicMessages.success, user: clientSafeUser }, { status: httpStatus.http200ok })
	} catch (error) {
		logger.errorUnknown(error, 'Unknown authorisation error: ')
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
