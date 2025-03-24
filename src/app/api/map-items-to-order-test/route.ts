import { checkAccess, getOrdersData } from '@/library/database/operations'
import { mapOrders } from '@/library/utilities/public'
import { type NextRequest, NextResponse } from 'next/server'

const routeDetail = 'GET map-items-to-order-test:'

export async function GET(request: NextRequest) {
	// Validate user
	const { foundDangerousUser } = await checkAccess({
		request,
		routeDetail,
		requireConfirmed: false,
		requireSubscriptionOrTrial: false,
	})

	if (!foundDangerousUser) return NextResponse.json({ status: 400 })

	// Get orders data
	const { ordersReceivedData } = await getOrdersData({ userId: foundDangerousUser.id, returnType: 'ordersReceived', routeDetail })

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

	const { ordersMadeData } = await getOrdersData({ userId: foundDangerousUser.id, returnType: 'ordersMade', routeDetail })

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
