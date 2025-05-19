'use client'
import AddInventoryForm from '@/app/inventory/components/AddInventoryForm'
import InventoryList from '@/app/inventory/components/InventoryList'
import InventorySizeMessage from '@/app/inventory/components/InventorySizeMessage'
import VatToggleButton from '@/app/inventory/components/VatToggleButton'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import TwoColumnContainer from '@/components/TwoColumnContainer'
import { useDemoUser } from '@/components/providers/demo/user'
import { useNotifications } from '@/components/providers/notifications'
import { useUi } from '@/components/providers/ui'
import { subtleDelay } from '@/library/utilities/public'
import type { InventoryAddFormData } from '@/library/validations'
import type { BrowserSafeMerchantProduct } from '@/types'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DemoInventoryPage() {
	const { demoUser, inventory, setInventory, vat } = useDemoUser()
	const { merchantMode } = useUi()
	const { successNotification, errorNotification } = useNotifications()
	const router = useRouter()

	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)

	useEffect(() => {
		if (!merchantMode) {
			router.push('/demo/dashboard')
		}
	}, [merchantMode, router])

	async function addProduct(formData: InventoryAddFormData): Promise<boolean> {
		setIsSubmitting(true)
		await subtleDelay()

		const priceInMinorUnits = formData.priceInMinorUnits === '' ? 0 : Number.parseInt(formData.priceInMinorUnits, 10)
		const customVat = formData.customVat === '' ? undefined : Number.parseInt(formData.customVat, 10)

		const newProduct = {
			id: Date.now(),
			name: formData.name,
			description: formData.description ?? null,
			priceInMinorUnits: priceInMinorUnits ?? null,
			customVat: customVat ?? 0,
			deletedAt: null,
		} satisfies BrowserSafeMerchantProduct

		setInventory((previousInventory) => (previousInventory ? [newProduct, ...previousInventory] : [newProduct]))
		successNotification(`${formData.name} added to inventory`)
		setIsSubmitting(false)
		return true
	}

	async function handleDelete(productId: number): Promise<boolean> {
		setIsDeleting(true)
		await subtleDelay()

		const productToDelete = inventory?.find((product) => product.id === productId)

		if (!productToDelete) {
			errorNotification('Product not found')
			return false
		}

		setInventory((previousInventory) => (previousInventory ? previousInventory.filter((item) => item.id !== productId) : []))
		successNotification(`${productToDelete.name} deleted`)
		setIsDeleting(false)
		return true
	}

	async function handleUpdate() {
		// Main ToDo!
		return true
	}

	return (
		<>
			<SignedInBreadCrumbs businessName={demoUser.businessName} currentPageTitle="Inventory" demoMode />
			<h1>Inventory</h1>
			<TwoColumnContainer
				mainColumn={
					<InventoryList //
						inventory={inventory}
						handleUpdate={handleUpdate}
						handleDelete={handleDelete}
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
