'use client'
import BreadCrumbsTest from '@/components/BreadCrumbsTest'
import RoleModeButton from '@/components/menubar/RoleModeButton'
import { useUi } from '@/providers/ui'
import { useUser } from '@/providers/user'
import CustomerFacingOrdersPage from './customerFacingOrdersPage'
import MerchantFacingOrdersPage from './merchantFacingOrderPage'

/* 
/orders - Orders dashboard
/orders/[order-id] - View specific order
/orders/new/[merchant-slug] - Create new order
*/

export default function OrdersPage() {
	const { merchantMode } = useUi()
	const { user } = useUser()

	if (!user) return null

	const title = user?.roles === 'both' ? (merchantMode ? 'Orders received' : 'Orders made') : 'Orders'

	return (
		<>
			<BreadCrumbsTest />
			<div className="flex flex-col gap-y-4 items-start">
				<h1>{title}</h1>
				<RoleModeButton />
				{merchantMode ? <MerchantFacingOrdersPage /> : <CustomerFacingOrdersPage />}
			</div>
		</>
	)
}
