import { apiPaths, httpStatus, userMessages } from '@/library/constants'
import { checkAccess, getOrdersData } from '@/library/database/operations'
import { initialiseDevelopmentLogger, mapOrders } from '@/library/utilities/public'
import type { OrderReceived } from '@/types'
import { type NextRequest, NextResponse } from 'next/server'

export interface OrdersAdminGETresponse {
	developmentMessage?: string
	userMessage?: typeof userMessages.serverError
	ordersReceived?: OrderReceived[]
}

// Get Orders received as a merchant, with search parameters
export async function GET(request: NextRequest): Promise<NextResponse<OrdersAdminGETresponse>> {
	const routeSignature = `GET ${apiPaths.orders.merchantPerspective.base}:`
	const developmentLogger = initialiseDevelopmentLogger(routeSignature)

	try {
		const { dangerousUser } = await checkAccess({
			request,
			routeSignature,
			requireConfirmed: false,
			requireSubscriptionOrTrial: false,
		})

		if (!dangerousUser) {
			const developmentMessage = developmentLogger('Authentication error')
			return NextResponse.json({ developmentMessage }, { status: 400 })
		}

		// Optimisation ToDo: add search parameters

		const { ordersReceivedData } = await getOrdersData({
			userId: dangerousUser.id,
			returnType: 'ordersReceived',
			routeSignature,
		})

		if (!ordersReceivedData) {
			const developmentMessage = developmentLogger('Legitimately no orders', 'level4info')
			return NextResponse.json({ developmentMessage }, { status: httpStatus.http204noContent })
		}

		const { ordersReceived } = mapOrders({
			orders: ordersReceivedData.orders,
			orderItems: ordersReceivedData.orderItems,
			customers: ordersReceivedData.customers,
			products: ordersReceivedData.products,
			returnType: 'ordersReceived',
		})

		return NextResponse.json({ ordersReceived }, { status: 200 })
	} catch (error) {
		const developmentMessage = developmentLogger('Caught error', 'level1error', error)
		return NextResponse.json({ developmentMessage, userMessage: userMessages.serverError }, { status: 500 })
	}
}
