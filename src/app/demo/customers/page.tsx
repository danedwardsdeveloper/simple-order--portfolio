'use client'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import UnderConstruction from '@/components/UnderConstruction'
import { useDemoUser } from '@/components/providers/demo/user'

export default function DemoInventoryPage() {
	const { demoUser } = useDemoUser()

	return (
		<>
			<SignedInBreadCrumbs businessName={demoUser.businessName} currentPageTitle="Customers" demoMode />
			<div className="">
				<h1>Customers</h1>
				<UnderConstruction />
			</div>
		</>
	)
}
