import { type authenticationMessages, type basicMessages, userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkAccess } from '@/library/database/operations'
import { products } from '@/library/database/schema'
import { convertEmptyToUndefined, initialiseDevelopmentLogger } from '@/library/utilities/public'
import type { BrowserSafeMerchantProduct, UnauthorisedMessages } from '@/types'
import { and, eq, isNull } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'

export interface InventoryAdminGETresponse {
	userMessage?: typeof userMessages.serverError
	message?:
		| typeof basicMessages.success
		| typeof basicMessages.serverError
		| UnauthorisedMessages
		| typeof authenticationMessages.merchantNotFound
	developmentMessage?: string
	inventory?: BrowserSafeMerchantProduct[]
}

// GET all products for the signed-in merchant
export async function GET(request: NextRequest): Promise<NextResponse<InventoryAdminGETresponse>> {
	const { developmentLogger } = initialiseDevelopmentLogger('/inventory', 'GET')

	try {
		const { dangerousUser, accessDenied } = await checkAccess({
			request,
			requireConfirmed: false,
			requireSubscriptionOrTrial: false,
		})

		if (accessDenied) {
			const developmentMessage = developmentLogger(accessDenied.message)
			return NextResponse.json({ developmentMessage }, { status: accessDenied.status })
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
			developmentMessage = developmentLogger('Legitimately no products found', { level: 'level3success' })
		}

		return NextResponse.json({ inventory, developmentMessage }, { status: 200 })
	} catch (error) {
		const developmentMessage = developmentLogger('Caught error', { error })
		return NextResponse.json({ userMessage: userMessages.serverError, developmentMessage }, { status: 500 })
	}
}
