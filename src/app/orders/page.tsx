'use client'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import RoleModeButton from '@/components/menubar/RoleModeButton'
import { useUi } from '@/providers/ui'
import { useUser } from '@/providers/user'
import CustomerFacingOrdersPage from './customerFacingOrdersPage'
import MerchantFacingOrdersPage from './merchantFacingOrderPage'

export default function OrdersPage() {
	const { merchantMode } = useUi()
	const { user } = useUser()

	if (!user) return null

	const dynamicTitle = user.roles === 'both' ? (merchantMode ? 'Orders as merchant' : 'Orders as customer') : 'Orders'

	return (
		<>
			<SignedInBreadCrumbs businessName={user.businessName} currentPageTitle={dynamicTitle} />
			<div className="flex flex-col gap-y-4 items-start">
				<RoleModeButton />
				<h1>{dynamicTitle}</h1>
				{merchantMode ? <MerchantFacingOrdersPage /> : <CustomerFacingOrdersPage />}
			</div>
		</>
	)
}
