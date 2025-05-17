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
import AddInventoryForm, { type InventoryAddFormData } from './components/AddInventoryForm'
import InventoryList from './components/InventoryList'
import InventorySizeMessage from './components/InventorySizeMessage'
import VatToggleButton from './components/VatToggleButton'

export default function InventoryPage() {
	const { user, inventory, setInventory, vat } = useUser()
	const { successNotification, errorNotification } = useNotifications()
	const router = useRouter()

	const [isSubmitting, setIsSubmitting] = useState(false)

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
			const customVat = formData.customVat === '' ? undefined : Number.parseInt(formData.customVat, 10)

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

	if (!user) return <UnauthorisedLinks />

	return (
		<>
			<SignedInBreadCrumbs businessName={user.businessName} currentPageTitle="Inventory" />
			<h1>Inventory</h1>
			<TwoColumnContainer
				mainColumn={<InventoryList inventory={inventory} />}
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
