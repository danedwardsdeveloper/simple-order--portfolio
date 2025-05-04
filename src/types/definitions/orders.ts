import type { orderItems, orders } from '@/library/database/schema'
import type { BrowserSafeMerchantProduct } from './products'

export type OrderStatusId = 1 | 2 | 3
export type OrderStatusName = 'Pending' | 'Completed' | 'Cancelled'

export type BaseOrder = typeof orders.$inferSelect
export type OrderInsertValues = typeof orders.$inferInsert

const _exampleBaseOrder: BaseOrder = {
	id: 0,
	customerId: 0,
	merchantId: 0,
	statusId: 1,
	requestedDeliveryDate: new Date(),
	adminOnlyNote: null,
	customerNote: null,
	createdAt: new Date(),
	updatedAt: new Date(),
}

export type RelationshipIds = Pick<OrderInsertValues, 'customerId' | 'merchantId'>

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
	statusName: OrderStatusName
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

export type OrderFunctionReturnType = 'orderMade' | 'orderReceived'
export type OrdersFunctionReturnType = 'ordersMade' | 'ordersReceived'
