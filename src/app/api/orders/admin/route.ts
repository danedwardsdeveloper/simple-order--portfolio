import { apiPaths, basicMessages, httpStatus, tokenMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkUserExists } from '@/library/database/operations'
import { orderItems, orders, products, users } from '@/library/database/schema'
import logger from '@/library/logger'
import { convertEmptyToUndefined } from '@/library/utilities'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import type { BrowserOrderItem, OrderItem, OrderReceived, TokenMessages } from '@/types'
import { eq, inArray } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'

export interface OrdersAdminGETresponse {
	message: TokenMessages | typeof basicMessages.success | typeof basicMessages.serverError | 'success, no orders'
	ordersReceived?: OrderReceived[]
}

const routeDetail = `GET ${apiPaths.orders.merchantPerspective.base}:`

// Get Orders received as a merchant, with search parameters
export async function GET(request: NextRequest): Promise<NextResponse<OrdersAdminGETresponse>> {
	// Optimisation ToDo: add search parameters
	try {
		const { extractedUserId, status, message } = await extractIdFromRequestCookie(request)

		if (!extractedUserId) {
			return NextResponse.json({ message }, { status })
		}

		const { userExists } = await checkUserExists(extractedUserId)
		if (!userExists) {
			return NextResponse.json({ message: tokenMessages.userNotFound }, { status: httpStatus.http401unauthorised })
		}

		// No need to checkActiveSubscriptionOrTrial

		const merchantOrders = convertEmptyToUndefined(await database.select().from(orders).where(eq(orders.merchantId, extractedUserId)))

		if (!merchantOrders) {
			logger.info(routeDetail, 'success, legitimately no orders')
			return NextResponse.json({ message: 'success, no orders' }, { status: httpStatus.http200ok })
		}

		const orderIds = merchantOrders.map((order) => order.id)
		const allOrderItems = await database.select().from(orderItems).where(inArray(orderItems.orderId, orderIds))

		const customerIds = [...new Set(merchantOrders.map((order) => order.customerId))]
		const customers = await database
			.select({
				id: users.id,
				firstName: users.firstName,
				lastName: users.lastName,
				email: users.email,
				businessName: users.businessName,
			})
			.from(users)
			.where(inArray(users.id, customerIds))

		const productIds = [...new Set(allOrderItems.map((item) => item.productId))]

		const productsData = await database
			.select({
				id: products.id,
				name: products.name,
				description: products.description,
				priceInMinorUnits: products.priceInMinorUnits,
				customVat: products.customVat,
			})
			.from(products)
			.where(inArray(products.id, productIds))

		const itemsMap = new Map()
		for (const item of allOrderItems) {
			if (!itemsMap.has(item.orderId)) {
				itemsMap.set(item.orderId, [])
			}
			itemsMap.get(item.orderId).push(item)
		}

		const customersMap = new Map(customers.map((customer) => [customer.id, customer]))
		const productsMap = new Map(productsData.map((product) => [product.id, product]))

		const mappedOrders: OrderReceived[] = merchantOrders.map((order): OrderReceived => {
			const orderItemsList = itemsMap.get(order.id) || []

			const mappedProducts: BrowserOrderItem[] = orderItemsList
				.map((orderItem: OrderItem) => {
					const product = productsMap.get(orderItem.productId)
					if (!product) return null

					// Optimisation ToDo: this is not type-safe at all - any properties can be added without error
					return {
						id: product.id,
						name: product.name,
						description: product.description,
						quantity: orderItem.quantity,
						priceInMinorUnitsWithoutVat: orderItem.priceInMinorUnitsWithoutVat,
						vat: orderItem.vat,
					}
				})
				.filter(Boolean)

			return {
				id: order.id,
				customerBusinessName: customersMap.get(order.customerId)?.businessName || 'Unknown customer',
				status: order.status,
				requestedDeliveryDate: order.requestedDeliveryDate,
				adminOnlyNote: order.adminOnlyNote || undefined,
				customerNote: order.customerNote || undefined,
				createdAt: order.createdAt,
				updatedAt: order.updatedAt,
				products: mappedProducts,
			}
		})

		const ordersReceived = convertEmptyToUndefined(mappedOrders)

		return NextResponse.json({ message: basicMessages.success, ordersReceived }, { status: httpStatus.http200ok })
	} catch (error) {
		logger.error(routeDetail, 'error: ', error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
