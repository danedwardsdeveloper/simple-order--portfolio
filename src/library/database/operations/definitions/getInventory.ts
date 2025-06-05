import { emptyToNull } from '@/library/utilities/public'
import { and, equals, isNull } from '@/library/utilities/server'
import type { BrowserSafeMerchantProduct } from '@/types'
import { database } from '../../connection'
import { products } from '../../schema'

export async function getInventory(userId: number): Promise<BrowserSafeMerchantProduct[] | null> {
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
		.where(and(equals(products.ownerId, userId), isNull(products.deletedAt)))

	return emptyToNull(foundInventory)
}
