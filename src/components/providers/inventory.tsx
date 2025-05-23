'use client'
import type { InventoryDELETEresponse } from '@/app/api/inventory/[itemId]/delete'
import type { InventoryItemPATCHbody, InventoryItemPATCHresponse } from '@/app/api/inventory/[itemId]/patch'
import type { InventoryItemSegment } from '@/app/api/inventory/[itemId]/route'
import type { InventoryAddPOSTbody, InventoryAddPOSTresponse } from '@/app/api/inventory/post'
import { userMessages } from '@/library/constants'
import { apiRequest, developmentDelay } from '@/library/utilities/public'
import type { InventoryAddFormData } from '@/library/validations'
import type { BrowserSafeMerchantProduct, InventoryContextType } from '@/types'
import { type ReactNode, createContext, useContext } from 'react'
import { useState } from 'react'
import { useNotifications } from './notifications'
import { useUser } from './user'

const InventoryContext = createContext<InventoryContextType | null>(null)

export function InventoryProvider({ children }: { children: ReactNode }) {
	const { inventory, setInventory } = useUser()
	const { successNotification, errorNotification } = useNotifications()

	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const [isUpdating, setIsUpdating] = useState(false)

	async function addProduct(formData: InventoryAddFormData): Promise<boolean> {
		setIsSubmitting(true)

		try {
			await developmentDelay()

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

	async function deleteProduct(productId: number): Promise<boolean> {
		setIsDeleting(true)
		const segment: InventoryItemSegment = String(productId)

		const product = inventory?.find((item) => item.id === productId)

		if (!product) {
			errorNotification('Product not found')
			setIsDeleting(false)
			return false
		}

		try {
			await developmentDelay()

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

	async function updateProduct(currentData: BrowserSafeMerchantProduct, updateData: InventoryItemPATCHbody): Promise<boolean> {
		setIsUpdating(true)

		try {
			await developmentDelay()

			const { ok, userMessage } = await apiRequest<InventoryItemPATCHresponse, InventoryItemPATCHbody>({
				basePath: '/inventory',
				method: 'PATCH',
				segment: currentData.id,
				body: updateData,
			})

			if (ok) {
				setInventory((previousInventory) => {
					if (!previousInventory) return previousInventory

					return previousInventory.map((item) => {
						if (item.id === currentData.id) {
							return {
								...item,
								name: updateData.name ?? item.name,
								description: updateData.description ?? item.description,
								priceInMinorUnits:
									updateData.priceInMinorUnits !== undefined ? Number(updateData.priceInMinorUnits) : item.priceInMinorUnits,
								customVat: updateData.customVat !== undefined ? Number(updateData.customVat) : item.customVat,
							}
						}
						return item
					})
				})

				successNotification(`Updated ${updateData.name || currentData.name}`)
				return true
			}

			if (userMessage) errorNotification(userMessage)
			return false
		} catch {
			errorNotification(`Failed to update ${currentData.name}`)
			return false
		} finally {
			setIsUpdating(false)
		}
	}

	const value: InventoryContextType = {
		isSubmitting,
		isDeleting,
		isUpdating,
		addProduct,
		deleteProduct,
		updateProduct,
	}

	return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
}

export function useInventory() {
	const context = useContext(InventoryContext)

	if (!context) {
		throw new Error('useInventory must be used within an InventoryProvider')
	}

	return context
}
