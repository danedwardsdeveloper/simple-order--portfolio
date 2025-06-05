import type { products } from '@/library/database/schema'
import type { BrowserOrderItem } from './orders'

export type Product = typeof products.$inferSelect

/**
 * @example
const product: ProductInsertValues = {
	name: '',
	ownerId: 0,
	priceInMinorUnits: 0,
	description: '',
	customVat: 15,
}
 */
export type ProductInsertValues = typeof products.$inferInsert

export interface SelectedProduct {
	productId: number
	quantity: number
}

export type AnonymousProduct = Omit<ProductInsertValues, 'ownerId'>

// Keep the id here as it's useful for React mapping as it's guaranteed to be unique
export type BrowserSafeMerchantProduct = Pick<Product, 'id' | 'name' | 'description' | 'priceInMinorUnits' | 'customVat' | 'deletedAt'>

export type BrowserSafeCustomerProduct = Omit<BrowserSafeMerchantProduct, 'deletedAt'>

const _exampleBrowserSafeMerchantProduct: BrowserSafeMerchantProduct = {
	id: 0,
	name: '',
	description: null,
	priceInMinorUnits: 0,
	customVat: 5,
	deletedAt: null,
}

export type FormattedProduct = Pick<BrowserOrderItem, 'id' | 'name' | 'quantity'> & {
	itemPrice: string
	vatPercentage: string
	subTotalVatOnly?: string
	subtotalWithoutVat: string
	subtotalWithVat: string
}
