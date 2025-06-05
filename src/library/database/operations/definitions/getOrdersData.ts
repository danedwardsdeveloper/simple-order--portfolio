import { database } from '@/library/database/connection'
import { orderItems, orders, products, users } from '@/library/database/schema'
import logger from '@/library/logger'
import { equals } from '@/library/utilities/server'
import type { BaseOrder, DangerousBaseUser, OrderItem, OrdersType, Product, RelationshipIds } from '@/types'
import { inArray } from 'drizzle-orm'

interface Input {
	userId: number
	returnType: OrdersType
}

interface BaseOrderData {
	orders: BaseOrder[]
	orderItems: OrderItem[]
	products: Product[]
}

interface Output {
	ordersReceivedData?: BaseOrderData & {
		customers: DangerousBaseUser[]
	}
	ordersMadeData?: BaseOrderData & {
		merchants: DangerousBaseUser[]
	}
}

export async function getOrdersData({ userId, returnType }: Input): Promise<Output> {
	try {
		const ordersMadeMode = returnType === 'ordersMade'
		const userIdKey: keyof RelationshipIds = ordersMadeMode ? 'customerId' : 'merchantId'
		const relationshipIdKey: keyof RelationshipIds = ordersMadeMode ? 'merchantId' : 'customerId'

		const ordersData = await database.select().from(orders).where(equals(orders[userIdKey], userId))

		if (ordersData.length === 0) return {}

		const orderIds = ordersData.map((order) => order.id)

		const orderItemsData = await database.select().from(orderItems).where(inArray(orderItems.orderId, orderIds))

		const productIds = [...new Set(orderItemsData.map((item) => item.productId))]

		const productDetails = await database.select().from(products).where(inArray(products.id, productIds))

		const relationshipIds = [...new Set(ordersData.map((order) => order[relationshipIdKey]))]

		const relationshipsData = await database.select().from(users).where(inArray(users.id, relationshipIds))

		const baseData: BaseOrderData = {
			orders: ordersData,
			orderItems: orderItemsData,
			products: productDetails,
		}

		if (ordersMadeMode) {
			return {
				ordersMadeData: {
					...baseData,
					merchants: relationshipsData,
				},
			}
		}

		return {
			ordersReceivedData: {
				...baseData,
				customers: relationshipsData,
			},
		}
	} catch (error) {
		logger.error('getOrdersData error: ', error)
		return {}
	}
}
