'use client'
import ConfirmationModal from '@/components/ConfirmationModal'
import Spinner from '@/components/Spinner'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { apiPaths } from '@/library/constants'
import { capitaliseFirstLetter } from '@/library/utilities/public'
import { useUi } from '@/providers/ui'
import { useUser } from '@/providers/user'
import type { OrderStatus } from '@/types'
import { useState } from 'react'
import urlJoin from 'url-join'
import OrderReceivedCard from './components/OrderReceivedCard'

export default function OrdersReceivedSection() {
	const { user, isLoading, ordersReceived, setOrdersReceived } = useUser()
	const [confirmationModalOpen, setConfirmationModalOpen] = useState(false)
	const [pendingStatusChange, setPendingStatusChange] = useState<{
		orderId: number
		currentStatus: OrderStatus
		newStatus: OrderStatus
	} | null>(null)
	const [isUpdating, setIsUpdating] = useState(false)
	const { includeVat } = useUi()

	if (isLoading) return <Spinner />
	if (!user) return <UnauthorisedLinks />
	if (!ordersReceived)
		return <p className="lg:-mx-3 w-full text-blue-600 p-3 border-2 border-blue-300 bg-blue-50 rounded-xl max-w-xl">No orders found</p>

	function initiateStatusChange(orderId: number, currentStatus: OrderStatus, newStatus: OrderStatus) {
		setPendingStatusChange({ orderId, currentStatus, newStatus })
		setConfirmationModalOpen(true)
	}

	async function confirmStatusChange() {
		if (!pendingStatusChange) return

		setIsUpdating(true)
		try {
			const { orderId, newStatus } = pendingStatusChange

			const response = await fetch(urlJoin(apiPaths.orders.merchantPerspective.base, orderId.toString()), {
				method: 'PATCH',
				body: JSON.stringify({ status: newStatus }),
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
			})

			if (!response.ok) throw new Error('Failed to update status')

			if (ordersReceived) {
				setOrdersReceived(ordersReceived.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
			}
			setConfirmationModalOpen(false)
		} catch {
			// Handle error (show notification, etc.)
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
