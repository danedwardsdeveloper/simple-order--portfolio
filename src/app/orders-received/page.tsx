'use client'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { useUser } from '@/providers/user'

export default function Page() {
	const { user } = useUser()

	if (!user) return <UnauthorisedLinks />

	return (
		<>
			<SignedInBreadCrumbs businessName={user.businessName} currentPageTitle="Orders received" />
			<h1>Orders received</h1>
		</>
	)
}
