'use client'
import { useDemoUser } from '@/components/providers/demo/user'
import { useNotifications } from '@/components/providers/notifications'
import { subtleDelay } from '@/library/utilities/public'
import type { InventoryAddFormData, InventoryUpdateFormData } from '@/library/validations'
import type { BrowserSafeMerchantProduct, InventoryContextType } from '@/types'
import { type ReactNode, createContext, useContext, useState } from 'react'

const DemoInventoryContext = createContext<InventoryContextType | null>(null)

export function DemoInventoryProvider({ children }: { children: ReactNode }) {
	const { inventory, setInventory } = useDemoUser()
	const { successNotification, errorNotification } = useNotifications()

	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const [isUpdating, setIsUpdating] = useState(false)

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

	async function deleteProduct(productId: number): Promise<boolean> {
		setIsDeleting(true)
		await subtleDelay()

		const productToDelete = inventory?.find((product) => product.id === productId)

		if (!productToDelete) {
			errorNotification('Product not found')
			setIsDeleting(false)
			return false
		}

		setInventory((previousInventory) => (previousInventory ? previousInventory.filter((item) => item.id !== productId) : []))
		successNotification(`${productToDelete.name} deleted`)
		setIsDeleting(false)
		return true
	}

	async function updateProduct(currentProduct: BrowserSafeMerchantProduct, updateData: InventoryUpdateFormData): Promise<boolean> {
		setIsUpdating(true)
		await subtleDelay()

		const updatedProduct = {
			...currentProduct,
			name: updateData.name ?? currentProduct.name,
			description: updateData.description ?? currentProduct.description,
			priceInMinorUnits:
				updateData.priceInMinorUnits !== undefined ? Number(updateData.priceInMinorUnits) : currentProduct.priceInMinorUnits,
			customVat: updateData.customVat !== undefined ? Number(updateData.customVat) : currentProduct.customVat,
		}

		setInventory((previousInventory) => {
			if (!previousInventory) return [updatedProduct]
			return previousInventory.map((item) => (item.id === currentProduct.id ? updatedProduct : item))
		})

		successNotification(`${updatedProduct.name} updated`)
		setIsUpdating(false)
		return true
	}

	const value: InventoryContextType = {
		isSubmitting,
		isDeleting,
		isUpdating,
		addProduct,
		deleteProduct,
		updateProduct,
	}

	return <DemoInventoryContext.Provider value={value}>{children}</DemoInventoryContext.Provider>
}

export function useDemoInventory() {
	const context = useContext(DemoInventoryContext)

	if (!context) {
		throw new Error('useDemoInventory must be used within a DemoInventoryProvider')
	}

	return context
}
