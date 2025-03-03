'use client'
import type { InventoryAddPOSTbody, InventoryAddPOSTresponse } from '@/app/api/inventory/admin/route'
import { apiPaths, serviceConstraints } from '@/library/constants'
import { containsIllegalCharacters, generateRandomString } from '@/library/utilities'
import { useNotifications } from '@/providers/notifications'
import { useUser } from '@/providers/user'
import type { NewNotification } from '@/types'
import { type FormEvent, useEffect, useState } from 'react'

export type InventoryAddFormData = {
	[K in keyof InventoryAddPOSTbody]-?: InventoryAddPOSTbody[K] extends string | null | undefined
		? string
		: InventoryAddPOSTbody[K] extends number | null | undefined
			? number
			: InventoryAddPOSTbody[K]
}

export default function AddInventoryForm() {
	const { user, setInventory, vat } = useUser()
	const [formData, setFormData] = useState<InventoryAddFormData>({
		name: '',
		description: '',
		priceInMinorUnits: 0,
		customVat: vat,
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

	async function handleSubmit(event: FormEvent) {
		event.preventDefault()
		setErrorMessage('')

		if (!user) {
			setErrorMessage('Not signed in')
			return
		}

		const { message, addedProduct }: InventoryAddPOSTresponse = await (
			await fetch(apiPaths.inventory.admin.base, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					...formData,
				} satisfies InventoryAddPOSTbody),
			})
		).json()

		if (addedProduct) {
			setInventory((previousInventory) => (previousInventory ? [...previousInventory, addedProduct] : [addedProduct]))

			const notification: NewNotification = {
				title: 'Success',
				message: `${formData.name} added to inventory`,
				level: 'success',
			}

			createNotification(notification)
			const newRandomString = generateRandomString()
			setFormData({
				name: newRandomString,
				description: newRandomString,
				priceInMinorUnits: Math.floor(Math.random() * serviceConstraints.maximumProductValueInMinorUnits + 1),
				customVat: Math.floor(Math.random() * serviceConstraints.highestVat + 1),
			})
			return
		}
		setErrorMessage(message)
	}

	// ToDo: sort out this ai-generated nonsense

	const handleNameChange = (value: string) => {
		setFormData({ ...formData, name: value })
	}

	const handleDescriptionChange = (value: string) => {
		setFormData({ ...formData, description: value })
	}

	const handlePriceChange = (value: string) => {
		setFormData({ ...formData, priceInMinorUnits: Number(value) })
	}

	const handleVatChange = (value: string) => {
		setFormData({ ...formData, customVat: Number(value) })
	}

	return (
		<form onSubmit={handleSubmit} className="p-4 border-2 border-zinc-200 rounded-xl flex flex-col gap-y-4 max-w-xl -mx-3">
			<h2 className="">Add an item</h2>

			<div>
				<div className="mb-1">
					<label htmlFor="name">Name</label>
					{illegalCharacterWarnings.name && (
						<span className="text-red-600 text-sm mt-2">Only letters, numbers, and {`',.!? -`} are allowed.</span>
					)}
				</div>
				<input id="name" type="text" value={formData.name} onChange={(event) => handleNameChange(event.target.value)} className="w-full" />
			</div>

			<div>
				<label htmlFor="description" className="block mb-1">
					Description
				</label>
				{illegalCharacterWarnings.description && (
					<p className="text-red-600 text-sm mt-2">Only letters, numbers, and {`',.!? -`} are allowed.</p>
				)}
				<input
					id="description"
					type="text"
					value={formData.description}
					onChange={(event) => handleDescriptionChange(event.target.value)}
					className="w-full"
				/>
			</div>

			{/* ToDo: this is horrible and won't let you completely wipe the field */}
			<div>
				<label htmlFor="price" className="block mb-1">
					Price
				</label>
				<input
					id="price"
					type="number"
					value={formData.priceInMinorUnits}
					onChange={(event) => handlePriceChange(event.target.value)}
					className="w-full"
				/>
			</div>

			<div>
				<label htmlFor="vat" className="block mb-1">
					VAT
				</label>
				<input
					id="vat"
					type="number"
					value={formData.customVat}
					onChange={(event) => handleVatChange(event.target.value)}
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
