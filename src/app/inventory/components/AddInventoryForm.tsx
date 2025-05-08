'use client'
import type { InventoryAddPOSTbody, InventoryAddPOSTresponse } from '@/app/api/inventory/post'
import { useNotifications } from '@/components/providers/notifications'
import { useUser } from '@/components/providers/user'
import { serviceConstraints, userMessages } from '@/library/constants'
import { apiRequest, containsIllegalCharacters } from '@/library/utilities/public'
import type { NewNotification } from '@/types'
import { type FormEvent, useEffect, useState } from 'react'

export type InventoryAddFormData = {
	name: string
	description: string
	priceInMinorUnits: string
	customVat: string
}

export default function AddInventoryForm() {
	const { user, inventory, setInventory, vat } = useUser()
	const [formData, setFormData] = useState<InventoryAddFormData>({
		name: '',
		description: '',
		priceInMinorUnits: '',
		customVat: String(vat),
	})
	const [errorMessage, setErrorMessage] = useState('')
	const [illegalCharacterWarnings, setIllegalCharacterWarnings] = useState<{
		name: boolean
		description: boolean
	}>({ name: false, description: false })
	const { createNotification } = useNotifications()

	useEffect(() => {
		setIllegalCharacterWarnings({
			name: containsIllegalCharacters(formData.name || ''),
			description: containsIllegalCharacters(formData.description || ''),
		})
	}, [formData.name, formData.description])

	if (inventory && inventory?.length > serviceConstraints.maximumProducts) {
		return null
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault()
		setErrorMessage('')

		if (!user) {
			setErrorMessage('Not signed in')
			return
		}

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

			const notification: NewNotification = {
				title: 'Success',
				message: `${formData.name} added to inventory`,
				level: 'success',
			}

			createNotification(notification)
			setFormData({
				name: '',
				description: '',
				priceInMinorUnits: '',
				customVat: '',
			})
			return
		}

		if (userMessage || !addedProduct) setErrorMessage(userMessage || userMessages.serverError)
	}

	const handleInputChange = (field: keyof InventoryAddFormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }))
	}

	return (
		<form onSubmit={handleSubmit} className="p-4 border-2 border-zinc-200 rounded-xl flex flex-col gap-y-4 max-w-xl lg:-mx-3">
			<h2 className="">Add an item</h2>

			<div>
				<div className="mb-1">
					<label htmlFor="name">Name</label>
					{illegalCharacterWarnings.name && <span className="text-red-600 mt-2">Only letters, numbers, and {`',.!? -`} are allowed.</span>}
				</div>
				<input
					id="name"
					type="text"
					value={formData.name}
					onChange={(event) => handleInputChange('name', event.target.value)}
					className="w-full"
				/>
			</div>

			<div>
				<label htmlFor="description" className="block mb-1">
					Description
				</label>
				{illegalCharacterWarnings.description && <p className="text-red-600 mt-2">Only letters, numbers, and {`',.!? -`} are allowed.</p>}
				<input
					id="description"
					type="text"
					value={formData.description}
					onChange={(event) => handleInputChange('description', event.target.value)}
					className="w-full"
				/>
			</div>

			<div>
				<label htmlFor="price" className="block mb-1">
					Price in pence
				</label>
				<input
					id="priceInMinorUnits"
					type="text"
					value={formData.priceInMinorUnits}
					onChange={(event) => handleInputChange('priceInMinorUnits', event.target.value)}
					className="w-full"
				/>
			</div>

			<div>
				<label htmlFor="vat" className="block mb-1">
					VAT percentage
				</label>
				<input
					id="customVat"
					placeholder="20"
					type="text"
					value={formData.customVat}
					onChange={(event) => handleInputChange('customVat', event.target.value)}
					className="w-full"
				/>
			</div>

			{errorMessage && <p className="text-red-600">{errorMessage}</p>}
			<div className="flex justify-center mt-8">
				<button type="submit" className="button-secondary w-full">
					Add item
				</button>
			</div>
		</form>
	)
}
