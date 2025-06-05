import type { BrowserSafeMerchantProduct, NonEmptyArray, Product } from '@/types'
import { emptyToNull } from '../../public'

type Props = {
	userId: number
	products: NonEmptyArray<Product> | null
}

export function filterInventory(props: Props): NonEmptyArray<BrowserSafeMerchantProduct> | null {
	if (!props.products) return null

	const inventory: BrowserSafeMerchantProduct[] = props.products
		.filter((product) => product.ownerId === props.userId && product.deletedAt === null)
		.map((product) => ({
			id: product.id,
			name: product.name,
			description: product.description,
			priceInMinorUnits: product.priceInMinorUnits,
			customVat: product.customVat,
			deletedAt: product.deletedAt,
		}))

	return emptyToNull(inventory)
}
