import { userMessages } from '@/library/constants'
import { checkAccess, getInventory } from '@/library/database/operations'
import { initialiseResponderNew } from '@/library/utilities/server'
import type { ApiResponse, UserContextType } from '@/types'
import type { NextRequest, NextResponse } from 'next/server'

type Success = {
	ok: true
	inventory: UserContextType['inventory']
}

type Failure = {
	userMessage: typeof userMessages.serverError | typeof userMessages.authenticationError
	developmentMessage?: string
	ok: false
}

export type InventoryAdminGETresponse = ApiResponse<Success, Failure>

// GET all products for the signed-in merchant
export async function GET(request: NextRequest): Promise<NextResponse<InventoryAdminGETresponse>> {
	const respond = initialiseResponderNew<Success, Failure>()

	try {
		const { dangerousUser, accessDenied } = await checkAccess({
			request,
			requireConfirmed: false,
			requireSubscriptionOrTrial: false,
		})

		if (accessDenied) {
			return respond({
				body: {
					userMessage: userMessages.authenticationError,
				},
				status: accessDenied.status,
				developmentMessage: accessDenied.message,
			})
		}

		const inventory = await getInventory(dangerousUser.id)

		if (!inventory) {
			return respond({
				body: { inventory },
				status: 200,
				developmentMessage: 'Legitimately no products found',
			})
		}

		return respond({
			body: { inventory },
			status: 200,
		})
	} catch (caughtError) {
		return respond({
			body: { userMessage: userMessages.serverError },
			status: 500,
			caughtError,
		})
	}
}
