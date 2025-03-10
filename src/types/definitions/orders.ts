import type { orderItems, orders } from '@/library/database/schema'
import type { BrowserSafeCustomerProduct } from './products'

export type Order = typeof orders.$inferSelect
export type OrderInsertValues = typeof orders.$inferInsert

export type OrderItem = typeof orderItems.$inferSelect
export type OrderItemInsertValues = typeof orderItems.$inferInsert

// This repeats the values from orderStatusEnum but I can't see any other way to get the values
export type OrderStatus = 'pending' | 'completed' | 'cancelled'

export interface BrowserSafeOrder {
	id: number
	customerBusinessName: string
	requestedDeliveryDate: Date
	adminOnlyNote?: string
	customerNote?: string
	status: OrderStatus
	items: OrderItem[]
	createdAt: Date
	updatedAt: Date
}

export interface BrowserSafeCustomerFacingOrder {
	id: number
	customerBusinessName: string
	requestedDeliveryDate: Date
	customerNote?: string
	status: OrderStatus
	products: BrowserSafeCustomerProduct[]
	createdAt: Date
	updatedAt: Date
}
