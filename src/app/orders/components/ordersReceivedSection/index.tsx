'use client'
import type {} from '@/app/api/orders/admin/[orderId]/route'
import ConfirmationModal from '@/components/ConfirmationModal'
import { useNotifications } from '@/components/providers/notifications'
import { useUi } from '@/components/providers/ui'
import { orderStatusNameToId, userMessages } from '@/library/constants'
import { capitaliseFirstLetter } from '@/library/utilities/public'
import type { OrderStatusName } from '@/types'
import { useState } from 'react'
import type { OrdersPageContentProps } from '../Content'
import OrderReceivedCard from './OrderReceivedCard'

type Props = Pick<OrdersPageContentProps, 'ordersReceived' | 'setOrdersReceived' | 'updateOrderStatus'>

export default function OrdersReceivedSection({ ordersReceived, setOrdersReceived, updateOrderStatus }: Props) {
	const { errorNotification, successNotification } = useNotifications()
	const [confirmationModalOpen, setConfirmationModalOpen] = useState(false)
	const [pendingStatusChange, setPendingStatusChange] = useState<{
		orderId: number
		currentStatus: OrderStatusName
		newStatus: OrderStatusName
	} | null>(null)
	const { includeVat } = useUi()

	if (!ordersReceived)
		return <p className="lg:-mx-3 w-full text-blue-600 p-3 border-2 border-blue-300 bg-blue-50 rounded-xl max-w-xl">No orders found</p>

	function initiateStatusChange(orderId: number, currentStatus: OrderStatusName, newStatus: OrderStatusName) {
		setPendingStatusChange({ orderId, currentStatus, newStatus })
		setConfirmationModalOpen(true)
	}

	async function confirmStatusChange() {
		if (!pendingStatusChange) return

		try {
			const { orderId, newStatus } = pendingStatusChange
			const newOrderStatusId = orderStatusNameToId[newStatus]

			const { updatedOrder, userMessage } = await updateOrderStatus(orderId, newOrderStatusId)

			if (updatedOrder) {
				setOrdersReceived((prevOrders) => {
					if (!prevOrders) return prevOrders

					return prevOrders.map((order) =>
						order.id === updatedOrder.id
							? {
									...order,
									adminOnlyNote: updatedOrder.adminOnlyNote || undefined,
									statusName: updatedOrder.statusName || order.statusName,
								}
							: order,
					)
				})
				successNotification(`Changed order status to ${newStatus}`)
			}

			if (userMessage) errorNotification(userMessage)

			setConfirmationModalOpen(false)
		} catch {
			errorNotification(userMessages.serverError)
		}
	}

	return (
		<>
			{pendingStatusChange && (
				<ConfirmationModal
					title={'Confirm status change'}
					content={
						<>
							<span>Are you sure you want to change the order status from </span>
							<strong>{capitaliseFirstLetter(pendingStatusChange.currentStatus)}</strong> to{' '}
							<strong>{capitaliseFirstLetter(pendingStatusChange.newStatus)}</strong>?
						</>
					}
					confirmButtonText="Update status"
					isOpen={confirmationModalOpen}
					onClose={() => setConfirmationModalOpen(false)}
					onConfirm={() => confirmStatusChange()}
					dataTestId={'ToDo'}
				/>
			)}
			<ul className="flex flex-col gap-y-8 w-full">
				{ordersReceived?.map((order, index) => (
					<OrderReceivedCard
						key={order.id}
						orderDetails={order}
						onStatusChangeRequest={initiateStatusChange}
						includeVat={includeVat}
						index={index}
					/>
				))}
			</ul>
		</>
	)
}
