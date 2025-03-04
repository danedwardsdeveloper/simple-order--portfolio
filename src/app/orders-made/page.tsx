'use client'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { useUser } from '@/providers/user'
import MerchantsList from '../orders/customerFacingOrdersPage/components/MerchantsList'

export default function Page() {
	const { user } = useUser()

	if (!user) return <UnauthorisedLinks />

	return (
		<>
			<SignedInBreadCrumbs businessName={user.businessName} currentPageTitle="Orders made" />
			<h1>Orders made</h1>
			<MerchantsList />
		</>
	)
}
