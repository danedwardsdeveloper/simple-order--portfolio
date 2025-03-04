import { apiPaths, basicMessages, httpStatus } from '@/library/constants'
import { database } from '@/library/database/connection'
import { orderItems, orders } from '@/library/database/schema'
import logger from '@/library/logger'
import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'

export interface OrdersAdminGETresponse {
	message: typeof basicMessages.success | typeof basicMessages.serverError
	// biome-ignore lint/suspicious/noExplicitAny: <temporary>
	orders?: any
}

interface GroupedOrdersMap {
	[orderId: number]: {
		items: (typeof orderItems.$inferSelect)[]
	} & typeof orders.$inferSelect
}

export async function GET(_request: NextRequest): Promise<NextResponse<OrdersAdminGETresponse>> {
	try {
		// 1. Extract userId from cookie
		// 2. Check user exists
		// 3. Build the query string from search parameters
		// 4. Retrieve and join the order details

		const ordersWithItems = await database.select().from(orders).leftJoin(orderItems, eq(orders.id, orderItems.orderId))

		// Group items by order ID
		const groupedOrders = ordersWithItems.reduce((accumulator: GroupedOrdersMap, row) => {
			const orderId = row.orders.id
			if (!accumulator[orderId]) {
				accumulator[orderId] = {
					...row.orders,
					items: [],
				}
			}
			if (row.order_items) {
				accumulator[orderId].items.push(row.order_items)
			}
			return accumulator
		}, {} as GroupedOrdersMap)

		const result = Object.values(groupedOrders)

		return NextResponse.json({ message: basicMessages.success, order: result }, { status: httpStatus.http200ok })
	} catch (error) {
		logger.error(`GET ${apiPaths.orders.merchantPerspective.base} error: `, error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
