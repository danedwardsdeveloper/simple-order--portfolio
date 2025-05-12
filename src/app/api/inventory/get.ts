import { userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkAccess } from '@/library/database/operations'
import { products } from '@/library/database/schema'
import { convertEmptyToUndefined } from '@/library/utilities/public'
import { initialiseResponder } from '@/library/utilities/server'
import type { BrowserSafeMerchantProduct } from '@/types'
import { and, eq, isNull } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'

export interface InventoryAdminGETresponse {
	userMessage?: typeof userMessages.serverError
	developmentMessage?: string
	inventory?: BrowserSafeMerchantProduct[]
}

// GET all products for the signed-in merchant
export async function GET(request: NextRequest): Promise<NextResponse<InventoryAdminGETresponse>> {
	const respond = initialiseResponder<InventoryAdminGETresponse>()

	try {
		const { dangerousUser, accessDenied } = await checkAccess({
			request,
			requireConfirmed: false,
			requireSubscriptionOrTrial: false,
		})

		if (accessDenied) {
			return respond({
				status: accessDenied.status,
				developmentMessage: accessDenied.message,
			})
		}

		const foundInventory: BrowserSafeMerchantProduct[] = await database
			.select({
				id: products.id,
				name: products.name,
				description: products.description,
				priceInMinorUnits: products.priceInMinorUnits,
				customVat: products.customVat,
				deletedAt: products.deletedAt,
			})
			.from(products)
			.where(and(eq(products.ownerId, dangerousUser.id), isNull(products.deletedAt)))

		const inventory = convertEmptyToUndefined(foundInventory)

		let developmentMessage: string | undefined

		if (!inventory) {
			return respond({
				status: 200,
				developmentMessage: 'Legitimately no products found',
			})
		}

		return NextResponse.json({ inventory, developmentMessage }, { status: 200 })
	} catch (caughtError) {
		return respond({
			body: { userMessage: userMessages.serverError },
			status: 500,
			caughtError,
		})
	}
}
