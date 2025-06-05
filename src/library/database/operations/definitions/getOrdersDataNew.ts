import { database } from '@/library/database/connection'
import { orderItems, orders, products, users } from '@/library/database/schema'
import logger from '@/library/logger'
import { equals, inArray, or } from '@/library/utilities/server'
import type { BaseOrder, DangerousBaseUser, OrderItem, Product, Roles, UserContextType } from '@/types'

interface Input {
	userId: number
	roles: Roles
}

interface BaseOrderData {
	orders: BaseOrder[]
	orderItems: OrderItem[]
	products: Product[]
}

interface Output {
	inventory: UserContextType['inventory']
	ordersReceivedData?: BaseOrderData & {
		customers: DangerousBaseUser[]
	}
	ordersMadeData?: BaseOrderData & {
		merchants: DangerousBaseUser[]
	}
}

export async function getOrdersDataNew({ userId, roles }: Input): Promise<Output> {
	try {
		// Fix roles logic: customers make orders, merchants receive orders
		const includeOrdersMade = roles !== 'merchant' // customers and mixed roles can make orders
		const includeOrdersReceived = roles !== 'customer' // merchants and mixed roles receive orders

		// Always fetch inventory if user can receive orders (is a merchant)
		let inventory: UserContextType['inventory'] = null

		// Build where conditions for orders
		const whereConditions = []
		if (includeOrdersMade) {
			whereConditions.push(equals(orders.customerId, userId))
		}
		if (includeOrdersReceived) {
			whereConditions.push(equals(orders.merchantId, userId))
		}

		// If no conditions, return early with just inventory
		if (whereConditions.length === 0) {
			return { inventory }
		}

		const allOrdersData = await database
			.select()
			.from(orders)
			.where(or(...whereConditions))

		// If no orders, fetch inventory separately if needed and return early
		if (allOrdersData.length === 0) {
			if (includeOrdersReceived) {
				const inventoryData = await database.select().from(products).where(equals(products.ownerId, userId))
				inventory = inventoryData.length === 0 ? null : inventoryData
			}
			return { inventory }
		}

		// Separate orders by type
		const ordersMadeData = includeOrdersMade ? allOrdersData.filter((order) => order.customerId === userId) : []
		const ordersReceivedData = includeOrdersReceived ? allOrdersData.filter((order) => order.merchantId === userId) : []

		const allOrderIds = allOrdersData.map((order) => order.id)

		// Get all related data
		const allOrderItems = await database.select().from(orderItems).where(inArray(orderItems.orderId, allOrderIds))

		// Build products query conditions
		const productIds = [...new Set(allOrderItems.map((item) => item.productId))]
		const productConditions = []

		if (productIds.length > 0) {
			productConditions.push(inArray(products.id, productIds))
		}
		if (includeOrdersReceived) {
			productConditions.push(equals(products.ownerId, userId))
		}

		// Get all products in one query
		const allProducts =
			productConditions.length > 0
				? await database
						.select()
						.from(products)
						.where(or(...productConditions))
				: []

		// Separate products by type
		const orderProducts = allProducts.filter((product) => productIds.includes(product.id))
		const inventoryProducts = includeOrdersReceived ? allProducts.filter((product) => product.ownerId === userId) : []

		inventory = inventoryProducts.length === 0 ? null : inventoryProducts

		const customerIds = [...new Set(allOrdersData.map((order) => order.customerId))]
		const merchantIds = [...new Set(allOrdersData.map((order) => order.merchantId))]
		const allRelationshipIds = [...new Set([...customerIds, ...merchantIds])]

		const allUsers = await database.select().from(users).where(inArray(users.id, allRelationshipIds))

		// Create lookup map and helper function to safely get users
		const usersById = new Map(allUsers.map((user) => [user.id, user]))
		const getUsersById = (ids: number[]): DangerousBaseUser[] =>
			ids.map((id) => usersById.get(id)).filter((user): user is DangerousBaseUser => user !== undefined)

		const result: Output = { inventory }

		if (includeOrdersMade && ordersMadeData.length > 0) {
			const ordersMadeIds = ordersMadeData.map((order) => order.id)
			const ordersMadeItems = allOrderItems.filter((item) => ordersMadeIds.includes(item.orderId))
			const ordersMadeProductIds = [...new Set(ordersMadeItems.map((item) => item.productId))]
			const ordersMadeProducts = orderProducts.filter((product) => ordersMadeProductIds.includes(product.id))
			const merchantIds = [...new Set(ordersMadeData.map((order) => order.merchantId))]
			const merchants = getUsersById(merchantIds)

			result.ordersMadeData = {
				orders: ordersMadeData,
				orderItems: ordersMadeItems,
				products: ordersMadeProducts,
				merchants,
			}
		}

		if (includeOrdersReceived && ordersReceivedData.length > 0) {
			const ordersReceivedIds = ordersReceivedData.map((order) => order.id)
			const ordersReceivedItems = allOrderItems.filter((item) => ordersReceivedIds.includes(item.orderId))
			const ordersReceivedProductIds = [...new Set(ordersReceivedItems.map((item) => item.productId))]
			const ordersReceivedProducts = orderProducts.filter((product) => ordersReceivedProductIds.includes(product.id))
			const customerIds = [...new Set(ordersReceivedData.map((order) => order.customerId))]
			const customers = getUsersById(customerIds)

			result.ordersReceivedData = {
				orders: ordersReceivedData,
				orderItems: ordersReceivedItems,
				products: ordersReceivedProducts,
				customers,
			}
		}

		return result
	} catch (error) {
		logger.error('getOrdersDataNew error: ', error)
		return { inventory: null }
	}
}
