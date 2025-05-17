'use client'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import UnderConstruction from '@/components/UnderConstruction'
import { useDemoUser } from '@/components/providers/demo/user'

export default function DemoOrdersPage() {
	const { demoUser } = useDemoUser()

	return (
		<>
			<SignedInBreadCrumbs businessName={demoUser.businessName} currentPageTitle="Orders" demoMode />
			<div className="">
				<h1>Orders</h1>
				<UnderConstruction />
			</div>
		</>
	)
}
