'use client'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import TwoColumnContainer from '@/components/TwoColumnContainer'
import { RoleModeToggleSection } from '@/components/menubar/RoleModeButton'
import { useUi } from '@/components/providers/ui'
import type { OrderStatusId, UserContextType } from '@/types'
import type { OrderAdminOrderIdPATCHresponse } from '../../api/orders/admin/[orderId]/route'
import OrdersMadeSection from './ordersMadeSection'
import MerchantsList from './ordersMadeSection/MerchantsList'
import OrdersReceivedSection from './ordersReceivedSection'

export type UpdateOrderStatusFunction = (orderId: number, newOrderStatusId: OrderStatusId) => Promise<OrderAdminOrderIdPATCHresponse>

export type OrdersPageContentProps = {
	user: NonNullable<UserContextType['user']>
	isDemo: boolean
	updateOrderStatus: UpdateOrderStatusFunction
} & Pick<UserContextType, 'confirmedMerchants' | 'ordersReceived' | 'setOrdersReceived' | 'ordersMade'>

// | 'setOrdersMade' | 'vat'

export default function OrdersPageContent({
	user,
	isDemo,
	confirmedMerchants,
	ordersReceived,
	ordersMade,
	setOrdersReceived,
	updateOrderStatus,
}: OrdersPageContentProps) {
	const { merchantMode } = useUi()

	const dynamicTitle = user.roles === 'both' || isDemo ? (merchantMode ? 'Orders received' : 'Orders made') : 'Orders'

	return (
		<>
			<SignedInBreadCrumbs businessName={user.businessName} currentPageTitle={dynamicTitle} isDemo={isDemo} />
			<h1>{dynamicTitle}</h1>

			<TwoColumnContainer
				sideColumn={(() => {
					if (!merchantMode) {
						return <MerchantsList isDemo={isDemo} confirmedMerchants={confirmedMerchants} />
					}

					if (user.roles === 'both') {
						return <RoleModeToggleSection />
					}
				})()}
				mainColumn={(() => {
					if (merchantMode) {
						return (
							<OrdersReceivedSection
								ordersReceived={ordersReceived}
								setOrdersReceived={setOrdersReceived}
								updateOrderStatus={updateOrderStatus}
							/>
						)
					}

					return <OrdersMadeSection ordersMade={ordersMade} />
				})()}
			/>
		</>
	)
}
