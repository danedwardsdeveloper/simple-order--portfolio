import { emptyToNull } from '@/library/utilities/public'
import { equals, inArray, or } from '@/library/utilities/server'
import type { NonEmptyArray, Product, Roles } from '@/types'
import { database } from '../../connection'
import { products } from '../../schema'

type Props = {
	userId: number
	roles: Roles
	productIds: NonEmptyArray<number> | null
}

export async function getProducts(props: Props): Promise<NonEmptyArray<Product> | null> {
	const conditions = []

	if (props.productIds) {
		conditions.push(inArray(products.id, props.productIds))
	}

	// Also return the inventory products
	if (props.roles !== 'customer') {
		conditions.push(equals(products.ownerId, props.userId))
	}

	if (conditions.length === 0) return null

	const allProducts = await database
		.select()
		.from(products)
		.where(or(...conditions))

	return emptyToNull(allProducts)
}
