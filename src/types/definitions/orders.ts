import type { orderItems, orders } from '@/library/database/schema'
import type { BrowserSafeCustomerProduct, BrowserSafeMerchantProduct } from './products'

export type Order = typeof orders.$inferSelect
export type OrderInsertValues = typeof orders.$inferInsert

export type OrderItem = typeof orderItems.$inferSelect
export type OrderItemInsertValues = typeof orderItems.$inferInsert

export type MerchantOrderItem = ''

export type BrowserOrderItem = Pick<OrderItem, 'priceInMinorUnitsWithoutVat' | 'quantity' | 'vat'> &
	Pick<BrowserSafeMerchantProduct, 'id' | 'name' | 'description'>

// This repeats the values from orderStatusEnum but I can't see any other way to get the values
export type OrderStatus = 'pending' | 'completed' | 'cancelled'

export interface BrowserSafeOrderReceived {
	id: number
	customerBusinessName: string
	requestedDeliveryDate: Date
	adminOnlyNote?: string
	customerNote?: string
	status: OrderStatus
	products: BrowserOrderItem[]
	createdAt: Date
	updatedAt: Date
}

export interface BrowserSafeOrderMade {
	id: number
	requestedDeliveryDate: Date
	customerNote?: string
	status: OrderStatus
	products: BrowserSafeCustomerProduct[]
	createdAt: Date
	updatedAt: Date
}
