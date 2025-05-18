'use client'
import type { InventoryAddPOSTbody, InventoryAddPOSTresponse } from '@/app/api/inventory/post'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import TwoColumnContainer from '@/components/TwoColumnContainer'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { useNotifications } from '@/components/providers/notifications'
import { useUser } from '@/components/providers/user'
import { userMessages } from '@/library/constants'
import { apiRequest } from '@/library/utilities/public'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { InventoryDELETEresponse, InventoryDELETEsegment } from '../api/inventory/[itemId]/delete'
import AddInventoryForm, { type InventoryAddFormData } from './components/AddInventoryForm'
import InventoryList from './components/InventoryList'
import InventorySizeMessage from './components/InventorySizeMessage'
import VatToggleButton from './components/VatToggleButton'

export default function InventoryPage() {
	const { user, inventory, setInventory, vat } = useUser()
	const { successNotification, errorNotification } = useNotifications()
	const router = useRouter()

	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)

	useEffect(() => {
		// Enhancement ToDo: Use this page to encourage customer-only users to start a free trial as a merchant

		if (user && user.roles === 'customer') {
			router.replace('/dashboard')
		}
	}, [user, router])

	async function addProduct(formData: InventoryAddFormData): Promise<boolean> {
		setIsSubmitting(true)

		try {
			const priceInMinorUnits = formData.priceInMinorUnits === '' ? 0 : Number.parseInt(formData.priceInMinorUnits, 10)
			const customVat = formData.customVat === '' ? 0 : Number.parseInt(formData.customVat, 10)

			const { userMessage, addedProduct } = await apiRequest<InventoryAddPOSTresponse, InventoryAddPOSTbody>({
				basePath: '/inventory',
				method: 'POST',
				body: {
					name: formData.name,
					description: formData.description,
					priceInMinorUnits,
					customVat,
				},
			})

			if (addedProduct) {
				setInventory((previousInventory) => (previousInventory ? [addedProduct, ...previousInventory] : [addedProduct]))
				successNotification(`${formData.name} added to inventory`)
				return true
			}

			if (userMessage) errorNotification(userMessage)
			else errorNotification(userMessages.serverError)
			return false
		} catch {
			errorNotification(userMessages.serverError)
			return false
		} finally {
			setIsSubmitting(false)
		}
	}

	async function handleDelete(productId: number): Promise<boolean> {
		setIsDeleting(true)
		const segment: InventoryDELETEsegment = String(productId)

		// Find the product in the inventory
		const product = inventory?.find((item) => item.id === productId)

		if (!product) {
			errorNotification('Product not found')
			return false
		}

		try {
			const { softDeletedProduct, userMessage } = await apiRequest<InventoryDELETEresponse>({
				basePath: '/inventory',
				segment,
				method: 'DELETE',
			})

			if (softDeletedProduct) {
				successNotification(`${product.name} deleted`)
				setInventory((previousInventory) =>
					previousInventory ? previousInventory.filter((item) => item.id !== softDeletedProduct.id) : [],
				)
				return true
			}

			if (userMessage) {
				errorNotification(userMessage)
			} else {
				errorNotification(`Failed to delete ${product.name}`)
			}
			return false
		} catch {
			errorNotification(`Failed to delete ${product.name}`)
			return false
		} finally {
			setIsDeleting(false)
		}
	}

	if (!user) return <UnauthorisedLinks />

	return (
		<>
			<SignedInBreadCrumbs businessName={user.businessName} currentPageTitle="Inventory" />
			<h1>Inventory</h1>
			<TwoColumnContainer
				mainColumn={<InventoryList inventory={inventory} handleDelete={(productId) => handleDelete(productId)} isDeleting={isDeleting} />}
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
