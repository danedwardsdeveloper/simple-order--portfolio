'use client'
import Spinner from '@/components/Spinner'
import { serviceConstraints } from '@/library/constants'
import { containsIllegalCharacters } from '@/library/utilities/public'
import type { BrowserSafeMerchantProduct } from '@/types'
import { type FormEvent, useEffect, useState } from 'react'

// ToDo: Use Zod here
export type InventoryAddFormData = {
	name: string
	description: string
	priceInMinorUnits: string
	customVat: string
}

interface AddInventoryFormProps {
	inventory: BrowserSafeMerchantProduct[] | null
	vat: number
	addProduct: (formData: InventoryAddFormData) => Promise<boolean>
	isSubmitting: boolean
}

export default function AddInventoryForm({ inventory, vat, addProduct, isSubmitting }: AddInventoryFormProps) {
	const initialFormState: InventoryAddFormData = {
		name: '',
		description: '',
		priceInMinorUnits: '',
		customVat: String(vat),
	}

	const [formData, setFormData] = useState<InventoryAddFormData>(initialFormState)
	const [errorMessage, setErrorMessage] = useState('')
	const [illegalCharacterWarnings, setIllegalCharacterWarnings] = useState<{
		name: boolean
		description: boolean
	}>({ name: false, description: false })

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

		const success = await addProduct(formData)
		if (success) {
			setFormData(initialFormState)
			return
		}

		setErrorMessage('Failed to add item')
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
			<div className="flex justify-center mt-8 min-h-7">
				<button type="submit" disabled={isSubmitting} className="button-secondary w-full">
					<div className="w-full flex items-center justify-center min-h-7">{isSubmitting ? <Spinner /> : 'Add item'}</div>
				</button>
			</div>
		</form>
	)
}
