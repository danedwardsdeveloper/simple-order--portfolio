import { database } from '@/library/database/connection'
import { products } from '@/library/database/schema'
import type { ProductInsertValues } from '@/types'

interface TestProductInsertValues {
	name: string
	priceInMinorUnits: number
}

export async function addProducts({ userId, items }: { userId: number; items: TestProductInsertValues[] }) {
	const productInsertValues: ProductInsertValues[] = items.map((item) => ({
		...item,
		ownerId: userId,
	}))

	return await database.insert(products).values(productInsertValues).returning()
}
