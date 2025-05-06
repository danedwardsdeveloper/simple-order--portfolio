import type { userMessages } from '@/library/constants'
import { checkAccess, getOrdersData } from '@/library/database/operations'
import { mapOrders } from '@/library/utilities/public'
import { initialiseResponder } from '@/library/utilities/server'
import type { OrderMade } from '@/types'
import type { NextRequest, NextResponse } from 'next/server'

export interface OrdersGETresponse {
	developmentMessage?: string
	userMessage?: typeof userMessages.serverError
	ordersMade?: OrderMade[]
}

type OutputGET = Promise<NextResponse<OrdersGETresponse>>

// Get orders that you have placed as a customer
export async function GET(request: NextRequest): OutputGET {
	const respond = initialiseResponder<OrdersGETresponse>()

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

		const { ordersMadeData } = await getOrdersData({
			userId: dangerousUser.id,
			returnType: 'ordersMade',
			routeSignature: '',
		})

		if (!ordersMadeData) {
			return respond({
				status: 200,
				developmentMessage: 'Legitimately no orders found',
			})
		}

		const { ordersMade } = mapOrders({
			orders: ordersMadeData.orders,
			orderItems: ordersMadeData.orderItems,
			merchants: ordersMadeData.merchants,
			products: ordersMadeData.products,
			returnType: 'ordersMade',
		})

		return respond({
			body: { ordersMade },
			status: 200,
		})
	} catch (caughtError) {
		return respond({
			status: 500,
			caughtError,
		})
	}
}
