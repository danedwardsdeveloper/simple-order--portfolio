import { orderStatusNameToId } from '@/library/constants'
import { database } from '@/library/database/connection'
import { orderItems, orders, products as productsTable } from '@/library/database/schema'
import { mapOrders } from '@/library/utilities/public'
import { equals, inArray } from '@/library/utilities/server'
import type { DangerousBaseUser, OrderInsertValues, OrderMade, SelectedProduct } from '@/types'

type Input = {
	customerId: number
	merchantProfile: DangerousBaseUser
	requestedDeliveryDate: Date
	customerNote?: string
	products: SelectedProduct[]
}

// Database transaction that creates an order
export async function createOrder({
	customerId,
	merchantProfile,
	requestedDeliveryDate,
	customerNote,
	products,
}: Input): Promise<OrderMade> {
	let txErrorMessage: string | undefined

	try {
		const newOrderInsertValues: OrderInsertValues = {
			customerId,
			merchantId: merchantProfile.id,
			requestedDeliveryDate,
			customerNote,
			statusId: orderStatusNameToId.Pending,
		}
		const newOrder = await database.transaction(async (tx) => {
			txErrorMessage = 'failed to create new order'
			const [createdOrder] = await tx.insert(orders).values(newOrderInsertValues).returning()

			txErrorMessage = 'failed to retrieve data from products table'
			const productsData = await tx
				.select()
				.from(productsTable)
				.where(
					inArray(
						productsTable.id,
						products.map((product: SelectedProduct) => product.productId),
					),
				)

			const orderItemsData = products.map((item) => {
				const product = productsData.find((product) => product.id === item.productId)
				if (!product) throw new Error(`Product ${item.productId} not found`)

				return {
					orderId: createdOrder.id,
					productId: item.productId,
					quantity: item.quantity,
					priceInMinorUnitsWithoutVat: product.priceInMinorUnits,
					vat: product.customVat,
				}
			})

			txErrorMessage = 'failed to created order_items rows'
			await tx.insert(orderItems).values(orderItemsData)

			txErrorMessage = undefined
			return createdOrder
		})

		const allOrderItems = await database.select().from(orderItems).where(equals(orderItems.orderId, newOrder.id))

		const productIds = allOrderItems.map((item) => item.productId)

		const productsData = await database.select().from(productsTable).where(inArray(productsTable.id, productIds))

		const [createdOrder = undefined] =
			mapOrders({
				orders: [newOrder],
				orderItems: allOrderItems,
				products: productsData,
				merchants: [merchantProfile],
				returnType: 'ordersMade',
			}).ordersMade || []

		if (!createdOrder) throw new Error(txErrorMessage)

		return createdOrder
	} catch (error) {
		throw new Error(error instanceof Error ? error.message : 'createOrder: unknown error')
	}
}
