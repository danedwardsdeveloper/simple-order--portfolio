import type { orderStatus } from '@/library/constants'
import type { orderItems, orders } from '@/library/database/schema'
import type { BrowserSafeMerchantProduct } from './products'

export type BaseOrder = typeof orders.$inferSelect
export type OrderInsertValues = typeof orders.$inferInsert

export type OrderStatus = (typeof orderStatus)[keyof typeof orderStatus]

export type OrderItem = typeof orderItems.$inferSelect
export type OrderItemInsertValues = typeof orderItems.$inferInsert

export type MerchantOrderItem = ''

export type BrowserOrderItem = Pick<OrderItem, 'priceInMinorUnitsWithoutVat' | 'quantity' | 'vat'> &
	Pick<BrowserSafeMerchantProduct, 'id' | 'name' | 'description'>

// Possibly change updatedAt to updatedByCustomerAt and updatedByMerchantAt
export interface OrderMade {
	id: number
	status: OrderStatus
	businessName: string
	requestedDeliveryDate: Date
	customerNote?: string
	createdAt: Date
	updatedAt: Date
	products: BrowserOrderItem[]
}

export interface OrderReceived extends OrderMade {
	adminOnlyNote?: string
}
