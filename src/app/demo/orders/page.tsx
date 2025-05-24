'use client'
import OrdersPageContent, { type UpdateOrderStatusFunction } from '@/app/orders/components/Content'
import { useDemoUser } from '@/components/providers/demo/user'
import { orderStatusIdToName } from '@/library/constants'
import { subtleDelay } from '@/library/utilities/public'
import type { OrderStatusId } from '@/types'

export default function DemoOrdersPage() {
	const { demoUser, confirmedMerchants, ordersReceived, setOrdersReceived, ordersMade, setOrdersMade } = useDemoUser()

	const updateOrderStatus: UpdateOrderStatusFunction = async (orderId: number, newOrderStatusId: OrderStatusId) => {
		await subtleDelay()
		const statusName = orderStatusIdToName[newOrderStatusId as OrderStatusId]

		setOrdersMade((prev) => (prev ? prev.map((order) => (order.id === orderId ? { ...order, statusName } : order)) : null))

		return {
			updatedOrder: {
				id: orderId,
				statusName,
			},
		}
	}

	return (
		<OrdersPageContent
			user={demoUser}
			confirmedMerchants={confirmedMerchants}
			isDemo={true}
			ordersReceived={ordersReceived}
			ordersMade={ordersMade}
			setOrdersReceived={setOrdersReceived}
			updateOrderStatus={updateOrderStatus}
		/>
	)
}
