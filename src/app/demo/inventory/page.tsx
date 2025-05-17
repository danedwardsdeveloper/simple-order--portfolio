'use client'
import InventoryList from '@/app/inventory/components/InventoryList'
import InventorySizeMessage from '@/app/inventory/components/InventorySizeMessage'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import TwoColumnContainer from '@/components/TwoColumnContainer'
import { useDemoUser } from '@/components/providers/demo/user'
import { useUi } from '@/components/providers/ui'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DemoInventoryPage() {
	const { demoUser, inventory } = useDemoUser()
	const { merchantMode } = useUi()

	const router = useRouter()

	useEffect(() => {
		if (!merchantMode) {
			router.push('/demo/dashboard')
		}
	}, [merchantMode, router])

	return (
		<>
			<SignedInBreadCrumbs businessName={demoUser.businessName} currentPageTitle="Inventory" demoMode />
			<h1>Inventory</h1>
			<TwoColumnContainer
				mainColumn={<InventoryList inventory={inventory} />}
				sideColumn={
					<>
						<InventorySizeMessage inventory={inventory} />
						{/* <VatToggleButton /> */}
						{/* <AddInventoryForm /> */}
					</>
				}
			/>
		</>
	)
}
