import type { orderStatus } from '@/library/constants'
import type { orderItems, orders } from '@/library/database/schema'
import type { BrowserSafeMerchantProduct } from './products'

export type BaseOrder = typeof orders.$inferSelect
export type OrderInsertValues = typeof orders.$inferInsert

const _exampleBaseOrder: BaseOrder = {
	id: 0,
	customerId: 0,
	merchantId: 0,
	status: 'pending',
	requestedDeliveryDate: new Date(),
	adminOnlyNote: null,
	customerNote: null,
	createdAt: new Date(),
	updatedAt: new Date(),
}

export type RelationshipIds = Pick<OrderInsertValues, 'customerId' | 'merchantId'>

export type OrderStatus = (typeof orderStatus)[keyof typeof orderStatus]

export type OrderItem = typeof orderItems.$inferSelect
export type OrderItemInsertValues = typeof orderItems.$inferInsert

export type BrowserOrderItem = Pick<OrderItem, 'priceInMinorUnitsWithoutVat' | 'quantity' | 'vat'> &
	Pick<BrowserSafeMerchantProduct, 'id' | 'name' | 'description'>

const _exampleBrowserOrderItem: BrowserOrderItem = {
	id: 0,
	priceInMinorUnitsWithoutVat: 0,
	quantity: 0,
	name: '',
	description: '',
	vat: 0,
}

// Possibly change updatedAt to updatedByCustomerAt and updatedByMerchantAt
export interface OrderMade {
	id: number
	status: OrderStatus
	businessName: string
	requestedDeliveryDate: Date
	customerNote?: string
	products: BrowserOrderItem[]
	createdAt: Date
	updatedAt: Date
}

export interface OrderReceived extends OrderMade {
	adminOnlyNote?: string
}

export type OrdersFunctionReturnType = 'ordersMade' | 'ordersReceived'
