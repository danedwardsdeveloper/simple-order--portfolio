'use client'
import type { InventoryAddPOSTbody, InventoryAddPOSTresponse } from '@/app/api/inventory/admin/route'
import { apiPaths, serviceConstraints } from '@/library/constants'
import { generateRandomString } from '@/library/utilities'
import { useNotifications } from '@/providers/notifications'
import { useUser } from '@/providers/user'
import type { NewNotification } from '@/types'
import { type FormEvent, useState } from 'react'

const formFields = {
	name: {
		label: 'Name',
		type: 'text',
		key: 'name',
	},
	description: {
		label: 'Description',
		type: 'text',
		key: 'description',
	},
	price: {
		label: 'Price',
		type: 'number',
		key: 'priceInMinorUnits',
	},
	vat: {
		label: 'VAT',
		type: 'number',
		key: 'customVat',
	},
} as const

export default function AddInventoryForm() {
	const { user, setInventory } = useUser()
	const temporaryRandomString = generateRandomString()
	const [formData, setFormData] = useState<InventoryAddPOSTbody>({
		name: temporaryRandomString,
		description: temporaryRandomString,
		priceInMinorUnits: Math.floor(Math.random() * serviceConstraints.maximumProductValueInMinorUnits + 1),
		customVat: Math.floor(Math.random() * serviceConstraints.highestVat + 1),
	})
	const [errorMessage, setErrorMessage] = useState('')
	const { createNotification } = useNotifications()

	async function handleSubmit(event: FormEvent) {
		event.preventDefault()
		setErrorMessage('')
		if (!user) {
			setErrorMessage('Not signed in')
			return
		}

		const { message, product }: InventoryAddPOSTresponse = await (
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

		if (product) {
			setInventory((previousInventory) => (previousInventory ? [...previousInventory, product] : [product]))

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

	// Enhancement ToDo: add illegal punctuation warning

	return (
		<form onSubmit={handleSubmit} className="p-4 border-2 border-zinc-200 rounded-xl flex flex-col gap-y-4 max-w-xl -mx-3">
			<h2 className="">Add an item</h2>
			{Object.entries(formFields).map(([id, field]) => (
				<div key={id}>
					<label htmlFor={id} className="block mb-1">
						{field.label}
					</label>
					<input
						id={id}
						type={field.type}
						value={formData[field.key] ?? ''}
						onChange={(event) =>
							setFormData({
								...formData,
								[field.key]: event.target.value,
							})
						}
						className="w-full"
					/>
				</div>
			))}
			{errorMessage && <p>{errorMessage}</p>}
			<div className="flex justify-center mt-8">
				<button type="submit" className="button-secondary w-full">
					Add item
				</button>
			</div>
		</form>
	)
}
