'use client'
import VatToggleButton from '@/app/inventory/components/VatToggleButton'
import { SignedInBreadCrumbs, SignedOutBreadCrumbs } from '@/components/BreadCrumbs'
import ConfirmationModal from '@/components/ConfirmationModal'
import TwoColumnContainer from '@/components/TwoColumnContainer'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { RoleModeToggleSection } from '@/components/menubar/RoleModeButton'
import { useNotifications } from '@/components/providers/notifications'
import { useUi } from '@/components/providers/ui'
import { orderStatusNameToId, userMessages } from '@/library/constants'
import logger from '@/library/logger'
import { capitaliseFirstLetter } from '@/library/utilities/public'
import type { OrderStatusId, OrderStatusName, UserContextType } from '@/types'
import { useState } from 'react'
import type { OrderAdminOrderIdPATCHresponse } from '../../api/orders/admin/[orderId]/route'
import MerchantsList from './MerchantsList'
import OrderCard from './orderCard'

export type UpdateOrderStatusFunction = (orderId: number, newOrderStatusId: OrderStatusId) => Promise<OrderAdminOrderIdPATCHresponse>

export type OrdersPageContentProps = {
	user: UserContextType['user']
	isDemo: boolean
	onUpdateStatus: UpdateOrderStatusFunction
} & Pick<UserContextType, 'confirmedMerchants' | 'ordersReceived' | 'setOrdersReceived' | 'ordersMade'>

export default function OrdersPageContent({
	user,
	isDemo,
	confirmedMerchants,
	ordersReceived,
	setOrdersReceived,
	ordersMade,
	onUpdateStatus,
}: OrdersPageContentProps) {
	const { merchantMode, includeVat, currency } = useUi()
	const { errorNotification, successNotification } = useNotifications()
	const [confirmationModalOpen, setConfirmationModalOpen] = useState(false)
	const [pendingStatusChange, setPendingStatusChange] = useState<{
		orderId: number
		currentStatus: OrderStatusName
		newStatus: OrderStatusName
	} | null>(null)

	if (!user)
		return (
			<>
				<SignedOutBreadCrumbs currentPageTitle="Orders" />
				<h1>Orders</h1>
				<UnauthorisedLinks />
			</>
		)

	function initiateStatusChange(orderId: number, currentStatus: OrderStatusName, newStatus: OrderStatusName) {
		setPendingStatusChange({ orderId, currentStatus, newStatus })
		setConfirmationModalOpen(true)
	}

	async function confirmStatusChange() {
		if (!pendingStatusChange) return

		try {
			const { orderId, newStatus } = pendingStatusChange
			const newOrderStatusId = orderStatusNameToId[newStatus]

			const { updatedOrder, userMessage } = await onUpdateStatus(orderId, newOrderStatusId)

			if (updatedOrder) {
				if (merchantMode) {
					setOrdersReceived((prevOrders) => {
						if (!prevOrders) return prevOrders

						return prevOrders.map((order) =>
							order.id === updatedOrder.id
								? {
										...order,
										adminOnlyNote: updatedOrder.adminOnlyNote || undefined,
										statusName: updatedOrder.statusName || order.statusName,
										updatedAt: new Date(),
									}
								: order,
						)
					})
				}
				successNotification(`Changed order status to ${newStatus}`)
			}

			if (userMessage) errorNotification(userMessage)

			setConfirmationModalOpen(false)
			setPendingStatusChange(null)
		} catch (error) {
			logger.error(error instanceof Error ? error.message : String(error))
			errorNotification(userMessages.serverError)
		}
	}

	const dynamicTitle = user.roles === 'both' || isDemo ? (merchantMode ? 'Orders received' : 'Orders made') : 'Orders'

	const resolvedOrders = merchantMode ? ordersReceived : ordersMade

	// Sort methods! - Delivery date, created, updated, order number

	const sortedOrders = resolvedOrders?.sort((a, b) => {
		const dateA = new Date(a.createdAt)
		const dateB = new Date(b.createdAt)
		return dateB.getTime() - dateA.getTime()
	})

	if (sortedOrders?.length === 0) {
		return (
			<>
				<SignedInBreadCrumbs businessName={user.businessName} currentPageTitle={dynamicTitle} isDemo={isDemo} />
				<h1>{dynamicTitle}</h1>
				<p>No orders found</p>
			</>
		)
	}

	return (
		<>
			<SignedInBreadCrumbs businessName={user.businessName} currentPageTitle={dynamicTitle} isDemo={isDemo} />
			<h1>{dynamicTitle}</h1>

			<TwoColumnContainer
				// sideColumnClasses="sticky top-18"
				sideColumn={
					<>
						{!merchantMode && <MerchantsList isDemo={isDemo} confirmedMerchants={confirmedMerchants} />}

						{user.roles === 'both' && <RoleModeToggleSection />}

						<VatToggleButton />
					</>
				}
				mainColumn={
					<ul className="flex flex-col gap-y-4 w-full max-w-xl">
						{sortedOrders?.map((order, index) => {
							const { businessName, id } = order
							if (merchantMode) {
								return (
									<OrderCard
										key={id}
										type="orderReceived"
										index={index}
										order={order}
										includeVat={includeVat}
										onStatusChangeRequest={initiateStatusChange}
										customerName={businessName}
										currency={currency}
									/>
								)
							}
							return (
								<OrderCard
									key={id}
									type="orderMade"
									index={index}
									order={order}
									includeVat={includeVat}
									onStatusChangeRequest={initiateStatusChange}
									merchantName={businessName}
									currency={currency}
								/>
							)
						})}
					</ul>
				}
			/>
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
				/>
			)}
		</>
	)
}
