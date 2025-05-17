'use client'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import TwoColumnContainer from '@/components/TwoColumnContainer'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { RoleModeToggleSection } from '@/components/menubar/RoleModeButton'
import { useUi } from '@/components/providers/ui'
import { useUser } from '@/components/providers/user'
import OrdersMadePage from './ordersMadeSection'
import MerchantsList from './ordersMadeSection/components/MerchantsList'
import OrdersReceivedPage from './ordersReceivedSection'

export default function OrdersPage() {
	const { merchantMode } = useUi()
	const { user } = useUser()

	if (!user) return <UnauthorisedLinks />

	const dynamicTitle = user.roles === 'both' ? (merchantMode ? 'Orders received' : 'Orders made') : 'Orders'

	return (
		<>
			<SignedInBreadCrumbs businessName={user.businessName} currentPageTitle={dynamicTitle} />
			<h1>{dynamicTitle}</h1>
			<TwoColumnContainer
				mainColumn={merchantMode ? <OrdersReceivedPage /> : <OrdersMadePage />}
				sideColumn={(() => {
					if (!merchantMode) {
						return <MerchantsList />
					}

					if (user.roles === 'both') {
						return <RoleModeToggleSection />
					}
				})()}
			/>
		</>
	)
}
