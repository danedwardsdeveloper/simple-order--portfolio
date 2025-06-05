import type { orderItems, orders } from '@/library/database/schema'
import type { BrowserSafeMerchantProduct, FormattedProduct } from './products'
import type { FormattedDate } from './timeDate'

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

export interface OrderMade {
	id: number
	statusName: OrderStatusName
	businessName: string
	requestedDeliveryDate: Date
	customerNote?: string
	products: BrowserOrderItem[]
	createdAt: Date
	updatedAt?: Date
}

export interface OrderReceived extends OrderMade {
	adminOnlyNote?: string
}

export type OrderType = 'orderMade' | 'orderReceived'
export type OrdersType = 'ordersMade' | 'ordersReceived'

export type FormattedOrder = {
	idNumber: number
	idString: string

	statusName: OrderStatusName

	merchantName: string
	customerName: string

	noVatOnOrder: boolean
	vatOnly: string
	totalWithVAT: string
	totalWithoutVAT: string

	products: FormattedProduct[]

	requestedDeliveryDate: FormattedDate
	createdAt: FormattedDate
	updatedAt?: FormattedDate

	adminOnlyNote?: string
	customerNote?: string
}

export type OnStatusChangeRequest = (orderId: number, currentStatus: OrderStatusName, newStatus: OrderStatusName) => void
