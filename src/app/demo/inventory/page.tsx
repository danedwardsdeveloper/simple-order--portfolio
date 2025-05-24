'use client'
import AddInventoryForm from '@/app/inventory/components/AddInventoryForm'
import InventoryList from '@/app/inventory/components/InventoryList'
import InventorySizeMessage from '@/app/inventory/components/InventorySizeMessage'
import VatToggleButton from '@/app/inventory/components/VatToggleButton'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import TwoColumnContainer from '@/components/TwoColumnContainer'
import { useDemoInventory } from '@/components/providers/demo/inventory'
import { useDemoUser } from '@/components/providers/demo/user'
import { useUi } from '@/components/providers/ui'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DemoInventoryPage() {
	const { demoUser, inventory, vat } = useDemoUser()
	const { addProduct, updateProduct, isUpdating, deleteProduct, isDeleting, isSubmitting } = useDemoInventory()

	const { merchantMode } = useUi()
	const router = useRouter()

	useEffect(() => {
		if (!merchantMode) {
			router.push('/demo/dashboard')
		}
	}, [merchantMode, router])

	return (
		<>
			<SignedInBreadCrumbs businessName={demoUser.businessName} currentPageTitle="Inventory" isDemo={true} />
			<h1>Inventory</h1>
			<TwoColumnContainer
				mainColumn={
					<InventoryList //
						inventory={inventory}
						updateProduct={updateProduct}
						isUpdating={isUpdating}
						deleteProduct={deleteProduct}
						isDeleting={isDeleting}
					/>
				}
				sideColumn={
					<>
						<InventorySizeMessage inventory={inventory} />
						<VatToggleButton />
						<AddInventoryForm addProduct={addProduct} inventory={inventory} vat={vat} isSubmitting={isSubmitting} />
					</>
				}
			/>
		</>
	)
}
