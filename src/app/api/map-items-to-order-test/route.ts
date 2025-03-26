import { checkAccess, getOrdersData } from '@/library/database/operations'
import { mapOrders } from '@/library/utilities/public'
import { type NextRequest, NextResponse } from 'next/server'

const routeSignature = 'GET map-items-to-order-test:'

export async function GET(request: NextRequest) {
	const { dangerousUser } = await checkAccess({
		request,
		routeSignature,
		requireConfirmed: false,
		requireSubscriptionOrTrial: false,
	})

	if (!dangerousUser) return NextResponse.json({}, { status: 400 })

	const { ordersReceivedData } = await getOrdersData({ userId: dangerousUser.id, returnType: 'ordersReceived', routeSignature })

	let ordersReceived = undefined

	if (ordersReceivedData) {
		ordersReceived = mapOrders({
			orders: ordersReceivedData.orders,
			orderItems: ordersReceivedData.orderItems,
			customers: ordersReceivedData.customers,
			products: ordersReceivedData.products,
			returnType: 'ordersReceived',
		}).ordersReceived
	}

	const { ordersMadeData } = await getOrdersData({ userId: dangerousUser.id, returnType: 'ordersMade', routeSignature })

	let ordersMade = undefined

	if (ordersMadeData) {
		ordersMade = mapOrders({
			orders: ordersMadeData.orders,
			orderItems: ordersMadeData.orderItems,
			merchants: ordersMadeData.merchants,
			products: ordersMadeData.products,
			returnType: 'ordersMade',
		}).ordersMade
	}

	return NextResponse.json({ ordersReceived, ordersMade }, { status: 200 })
}
