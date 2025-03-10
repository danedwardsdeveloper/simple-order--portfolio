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

			<h1>{dynamicTitle}</h1>
			<div data-component="two-column layout" className="mx-auto w-full grow flex flex-col lg:flex-row gap-8">
				<div className="flex-1 xl:flex order-last lg:order-first flex flex-col">
					{merchantMode ? <MerchantFacingOrdersPage /> : <CustomerFacingOrdersPage />}
				</div>

				<div className="shrink-0 lg:w-96 order-first lg:order-last">
					<div className="flex flex-col gap-y-4 ">
						<RoleModeButton />
					</div>
				</div>
			</div>
		</>
	)
}
