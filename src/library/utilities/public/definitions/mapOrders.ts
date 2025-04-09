import logger from '@/library/logger'
import type {
	BaseOrder,
	BrowserOrderItem,
	DangerousBaseUser,
	OrderFunctionReturnType,
	OrderItem,
	OrderMade,
	OrderReceived,
	OrdersFunctionReturnType,
	Product,
} from '@/types'
import { convertEmptyToUndefined } from './arrays'

export interface MapItemsToOrderInput {
	order: BaseOrder
	orderItems: OrderItem[]
	products: Product[]
	businessName: string
	returnType: OrderFunctionReturnType
}

// Exported for testing only
export function mapItemsToOrder({ order, orderItems, products, businessName, returnType }: MapItemsToOrderInput): {
	orderMade?: OrderMade
	orderReceived?: OrderReceived
} {
	const mappedProducts: BrowserOrderItem[] = orderItems
		.map((orderItem) => {
			const matchedProduct = products.find((product) => product.id === orderItem.productId)
			if (!matchedProduct) return null

			return {
				id: orderItem.productId,
				name: matchedProduct.name,
				description: matchedProduct.description,
				quantity: orderItem.quantity,
				priceInMinorUnitsWithoutVat: orderItem.priceInMinorUnitsWithoutVat,
				vat: orderItem.vat,
			}
		})
		.filter(Boolean) as BrowserOrderItem[]

	const orderReceived: OrderReceived = {
		id: order.id,
		status: order.status,
		businessName,
		adminOnlyNote: order.adminOnlyNote || undefined,
		customerNote: order.customerNote || undefined,
		requestedDeliveryDate: order.requestedDeliveryDate,
		createdAt: order.createdAt,
		updatedAt: order.updatedAt,
		products: mappedProducts,
	}

	if (returnType === 'orderReceived') return { orderReceived }

	const { adminOnlyNote, ...orderMade } = orderReceived

	return { orderMade }
}

interface MapOrdersProps {
	orders: BaseOrder[]
	orderItems: OrderItem[]
	merchants?: DangerousBaseUser[]
	customers?: DangerousBaseUser[]
	products: Product[]
	returnType: OrdersFunctionReturnType
}

export function mapOrders({ orders, orderItems, merchants, customers, products, returnType }: MapOrdersProps): {
	ordersMade?: OrderMade[]
	ordersReceived?: OrderReceived[]
} {
	const ordersMadeMode = returnType === 'ordersMade'
	const users = ordersMadeMode ? merchants : customers

	if (!users || users.length === 0) {
		logger.error(`mapOrders: ${ordersMadeMode ? 'merchants' : 'customers'} must be provided`)
		return {}
	}

	if (ordersMadeMode && !merchants) {
		logger.error('mapOrders: merchants must be provided if return type is ordersMade')
		return {}
	}

	if (!ordersMadeMode && !customers) {
		logger.error('mapOrders: customers must be provided if return type is ordersReceived')
		return {}
	}

	const itemsByOrderMap = new Map()

	for (const item of orderItems) {
		if (!itemsByOrderMap.has(item.orderId)) {
			itemsByOrderMap.set(item.orderId, [])
		}
		itemsByOrderMap.get(item.orderId).push(item)
	}

	const usersMap = new Map(users.map((user) => [user.id, user]))

	const mappedOrders = orders
		.map((order) => {
			const orderSpecificItems = itemsByOrderMap.get(order.id) || []
			const userIdKey = ordersMadeMode ? 'merchantId' : 'customerId'
			const user = usersMap.get(order[userIdKey])

			if (!user) {
				logger.error(`Error: ${ordersMadeMode ? 'Merchant' : 'Customer'} with ID ${order[userIdKey]} not found for order ${order.id}`)
				return null
			}

			const singularReturnType: OrderFunctionReturnType = returnType === 'ordersMade' ? 'orderMade' : 'orderReceived'

			const result = mapItemsToOrder({
				order,
				orderItems: orderSpecificItems,
				products,
				businessName: user.businessName,
				returnType: singularReturnType,
			})

			return ordersMadeMode ? result.orderMade : result.orderReceived
		})
		.filter(Boolean)

	if (ordersMadeMode) {
		const ordersMade = convertEmptyToUndefined(mappedOrders as OrderMade[])
		return { ordersMade }
	}

	const ordersReceived = convertEmptyToUndefined(mappedOrders as OrderReceived[])
	return { ordersReceived }
}
