'use client'
import type { OrderAdminOrderIdPATCHbody, OrderAdminOrderIdPATCHresponse } from '@/app/api/orders/admin/[orderId]/route'
import ConfirmationModal from '@/components/ConfirmationModal'
import Spinner from '@/components/Spinner'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { orderStatusNameToId, userMessages } from '@/library/constants'
import { apiRequest, capitaliseFirstLetter } from '@/library/utilities/public'
import { useNotifications } from '@/providers/notifications'
import { useUi } from '@/providers/ui'
import { useUser } from '@/providers/user'
import type { OrderStatusName } from '@/types'
import { useState } from 'react'
import OrderReceivedCard from './components/OrderReceivedCard'

export default function OrdersReceivedSection() {
	const { createNotification } = useNotifications()
	const { user, isLoading, ordersReceived, setOrdersReceived } = useUser()
	const [confirmationModalOpen, setConfirmationModalOpen] = useState(false)
	const [pendingStatusChange, setPendingStatusChange] = useState<{
		orderId: number
		currentStatus: OrderStatusName
		newStatus: OrderStatusName
	} | null>(null)
	const [isUpdating, setIsUpdating] = useState(false)
	const { includeVat } = useUi()

	if (isLoading) return <Spinner />
	if (!user) return <UnauthorisedLinks />
	if (!ordersReceived)
		return <p className="lg:-mx-3 w-full text-blue-600 p-3 border-2 border-blue-300 bg-blue-50 rounded-xl max-w-xl">No orders found</p>

	function initiateStatusChange(orderId: number, currentStatus: OrderStatusName, newStatus: OrderStatusName) {
		setPendingStatusChange({ orderId, currentStatus, newStatus })
		setConfirmationModalOpen(true)
	}

	async function confirmStatusChange() {
		if (!pendingStatusChange) return

		setIsUpdating(true)
		try {
			const { orderId, newStatus } = pendingStatusChange

			const newOrderStatusId = orderStatusNameToId[newStatus]

			const { updatedOrder, userMessage } = await apiRequest<OrderAdminOrderIdPATCHresponse, OrderAdminOrderIdPATCHbody>({
				basePath: 'orders/admin',
				segment: orderId,
				method: 'PATCH',
				body: { statusId: newOrderStatusId, id: orderId },
			})

			// Create failure notification
			if (userMessage) {
				createNotification({
					level: 'error',
					title: 'Error',
					message: userMessage,
				})
			}

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
			}

			setConfirmationModalOpen(false)
		} catch {
			createNotification({
				level: 'error',
				title: 'Error',
				message: userMessages.serverError,
			})
		} finally {
			setIsUpdating(false)
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
					confirmButtonContent={
						isUpdating ? (
							<>
								<Spinner colour="text-white" />
							</>
						) : (
							'Update status'
						)
					}
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
