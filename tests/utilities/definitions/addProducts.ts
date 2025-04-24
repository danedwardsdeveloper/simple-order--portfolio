import { database } from '@/library/database/connection'
import { products } from '@/library/database/schema'
import logger from '@/library/logger'
import type { Product, ProductInsertValues } from '@/types'

type Output = Promise<Product[] | undefined>
/**
 * @example
const productsToInsert: ProductInsertValues[] = [
	{
		ownerId: 1,
		name: 'Soup',
		priceInMinorUnits: 500,
	},
]

const addedProducts = await addProducts(productsToInsert)

//

const addedProducts = await addProducts([
	{
		ownerId: 1,
		name: 'Soup',
		priceInMinorUnits: 500,
	},
])
 */
export async function addProducts(items: ProductInsertValues[]): Output {
	try {
		return await database.insert(products).values(items).returning()
	} catch (error) {
		logger.error('addProducts caught error', error)
		return undefined
	}
}
