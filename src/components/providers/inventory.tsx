'use client'
import type { InventoryDELETEresponse, InventoryDELETEsegment } from '@/app/api/inventory/[itemId]/delete'
import type { InventoryAddPOSTbody, InventoryAddPOSTresponse } from '@/app/api/inventory/post'
import { userMessages } from '@/library/constants'
import { isDevelopment } from '@/library/environment/publicVariables'
import { apiRequest, subtleDelay } from '@/library/utilities/public'
import type { InventoryAddFormData } from '@/library/validations'
import type { BrowserSafeMerchantProduct } from '@/types'
import { type ReactNode, createContext, useContext } from 'react'
import { useState } from 'react'
import { useNotifications } from './notifications'
import { useUser } from './user'

export type HandleDeleteProduct = (productId: number) => Promise<boolean>
export type HandleUpdateProduct = (product: BrowserSafeMerchantProduct) => Promise<boolean>
export type HandleAddProduct = (formData: InventoryAddFormData) => Promise<boolean>

export interface InventoryContextType {
	isSubmitting: boolean
	isDeleting: boolean
	isUpdating: boolean
	addProduct: HandleAddProduct
	deleteProduct: HandleDeleteProduct
	updateProduct: HandleUpdateProduct
}

const InventoryContext = createContext<InventoryContextType | null>(null)

export function InventoryProvider({ children }: { children: ReactNode }) {
	const { inventory, setInventory } = useUser()
	const { successNotification, errorNotification } = useNotifications()

	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const [isUpdating, setIsUpdating] = useState(false)

	// Makes loading state visible in development
	async function developmentDelay() {
		if (isDevelopment) {
			await subtleDelay(400, 500)
		}
	}

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
		const segment: InventoryDELETEsegment = String(productId)

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

	async function updateProduct(product: BrowserSafeMerchantProduct): Promise<boolean> {
		setIsUpdating(true)

		try {
			await developmentDelay()

			// TODO: Implement the API call for updating a product
			// For now, we'll just update the local state

			setInventory((previousInventory) => {
				if (!previousInventory) return [product]
				return previousInventory.map((item) => (item.id === product.id ? product : item))
			})

			successNotification(`${product.name} updated`)
			return true
		} catch {
			errorNotification(`Failed to update ${product.name}`)
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
