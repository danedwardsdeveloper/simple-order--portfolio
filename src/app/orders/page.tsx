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

	return (
		<>
			<SignedInBreadCrumbs businessName={user.businessName} currentPageTitle="Orders" />
			<div className="flex flex-col gap-y-4 items-start">
				{/* This page is for users with only one role, so the context is clear */}
				<h1>Orders</h1>
				<RoleModeButton />
				{merchantMode ? <MerchantFacingOrdersPage /> : <CustomerFacingOrdersPage />}
			</div>
		</>
	)
}
