'use client'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import TwoColumnContainer from '@/components/TwoColumnContainer'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { InventoryProvider, useInventory } from '@/components/providers/inventory'
import { useUser } from '@/components/providers/user'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AddInventoryForm from './components/AddInventoryForm'
import InventoryList from './components/InventoryList'
import InventorySizeMessage from './components/InventorySizeMessage'
import VatToggleButton from './components/VatToggleButton'

export default function InventoryPage() {
	const { user, inventory, vat } = useUser()
	const { addProduct, isSubmitting, updateProduct, isUpdating, deleteProduct, isDeleting } = useInventory()
	const router = useRouter()

	useEffect(() => {
		if (user && user.roles === 'customer') {
			router.replace('/dashboard')
		}
	}, [user, router])

	if (!user) return <UnauthorisedLinks />

	return (
		<InventoryProvider>
			<SignedInBreadCrumbs businessName={user.businessName} currentPageTitle="Inventory" />
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
		</InventoryProvider>
	)
}
