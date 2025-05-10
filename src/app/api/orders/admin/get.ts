import { userMessages } from '@/library/constants'
import { checkAccess, getOrdersData } from '@/library/database/operations'
import { mapOrders } from '@/library/utilities/public'
import { initialiseResponder } from '@/library/utilities/server'
import type { OrderReceived } from '@/types'
import type { NextRequest, NextResponse } from 'next/server'

export interface OrdersAdminGETresponse {
	developmentMessage?: string
	userMessage?: typeof userMessages.serverError
	ordersReceived?: OrderReceived[]
}

type Output = Promise<NextResponse<OrdersAdminGETresponse>>

// Get Orders received as a merchant, with search parameters
export async function GET(request: NextRequest): Output {
	const respond = initialiseResponder<OrdersAdminGETresponse>()

	try {
		const { dangerousUser, accessDenied } = await checkAccess({
			request,
			requireConfirmed: false,
			requireSubscriptionOrTrial: false,
		})

		if (accessDenied) {
			return respond({
				status: accessDenied.status,
				developmentMessage: accessDenied.message,
			})
		}

		// Optimisation ToDo: add search parameters

		const { ordersReceivedData } = await getOrdersData({
			userId: dangerousUser.id,
			returnType: 'ordersReceived',
		})

		if (!ordersReceivedData) {
			return respond({
				status: 200, // Using 204 causes an error if it has a body
				developmentMessage: 'Legitimately no ordersReceived found',
			})
		}

		const { ordersReceived } = mapOrders({
			orders: ordersReceivedData.orders,
			orderItems: ordersReceivedData.orderItems,
			customers: ordersReceivedData.customers,
			products: ordersReceivedData.products,
			returnType: 'ordersReceived',
		})

		return respond({
			body: { ordersReceived },
			status: 200,
		})
	} catch (caughtError) {
		return respond({
			body: { userMessage: userMessages.serverError },
			status: 500,
			caughtError,
		})
	}
}
