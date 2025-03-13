import type { orderItems, orders } from '@/library/database/schema'
import type { BrowserSafeMerchantProduct } from './products'

export type Order = typeof orders.$inferSelect
export type OrderInsertValues = typeof orders.$inferInsert

export type OrderItem = typeof orderItems.$inferSelect
export type OrderItemInsertValues = typeof orderItems.$inferInsert

export type MerchantOrderItem = ''

export type BrowserOrderItem = Pick<OrderItem, 'priceInMinorUnitsWithoutVat' | 'quantity' | 'vat'> &
	Pick<BrowserSafeMerchantProduct, 'id' | 'name' | 'description'>

// This repeats the values from orderStatusEnum but I can't see any other way to get the values
export type OrderStatus = 'pending' | 'completed' | 'cancelled'

export interface OrderReceived {
	id: number
	status: OrderStatus
	businessName: string
	requestedDeliveryDate: Date
	adminOnlyNote?: string
	customerNote?: string
	createdAt: Date
	updatedAt: Date
	products: BrowserOrderItem[]
}

export interface OrderMade {
	id: number
	status: OrderStatus
	requestedDeliveryDate: Date
	customerNote?: string
	createdAt: Date
	updatedAt: Date
	products: BrowserOrderItem[]
}
