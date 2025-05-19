'use client'
import SubmitButton from '@/components/SubmitButton'
import { serviceConstraints } from '@/library/constants'
import { type InventoryAddFormData, inventoryAddFormInputSchema } from '@/library/validations'
import type { BrowserSafeMerchantProduct } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { type FieldError, useForm } from 'react-hook-form'

export interface AddInventoryFormProps {
	inventory: BrowserSafeMerchantProduct[] | null
	vat: number
	addProduct: (formData: InventoryAddFormData) => Promise<boolean>
	isSubmitting: boolean
}

export default function AddInventoryForm({ inventory, vat, addProduct, isSubmitting }: AddInventoryFormProps) {
	const [errorMessage, setErrorMessage] = useState('')

	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
		reset,
	} = useForm<InventoryAddFormData>({
		resolver: zodResolver(inventoryAddFormInputSchema),
		mode: 'onChange',
		defaultValues: {
			name: '',
			description: '',
			priceInMinorUnits: '',
			customVat: String(vat),
		},
	})

	if (inventory && inventory?.length > serviceConstraints.maximumProducts) {
		return null
	}

	async function onSubmit(data: InventoryAddFormData) {
		setErrorMessage('')

		const success = await addProduct(data)
		if (success) {
			reset()
			return
		}

		// ToDo: this could be more helpful
		setErrorMessage('Failed to add item')
	}

	function ErrorMessage(props: { error: FieldError | string | undefined }) {
		const { error } = props
		if (!error) return null

		return <p className="text-red-600 mt-2">{typeof error === 'string' ? error : error.message}</p>
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="p-4 border-2 border-zinc-200 rounded-xl flex flex-col gap-y-4 max-w-xl lg:-mx-3">
			<h2>Add an item</h2>

			<div>
				<div className="mb-1">
					<label htmlFor="name">Name</label>
					<ErrorMessage error={errors.name} />
				</div>
				<input
					id="name" //
					type="text"
					{...register('name')}
					aria-invalid={errors.name ? 'true' : 'false'}
					className="w-full"
				/>
			</div>

			<div>
				<label htmlFor="description" className="block mb-1">
					Description
					<span className="ml-2 text-zinc-500">optional</span>
				</label>
				<ErrorMessage error={errors.description} />
				<input
					id="description" //
					type="text"
					{...register('description')}
					aria-invalid={errors.description ? 'true' : 'false'}
					className="w-full"
				/>
			</div>

			<div>
				<label htmlFor="price" className="block mb-1">
					Price in pence
				</label>
				<ErrorMessage error={errors.priceInMinorUnits} />
				<input
					id="priceInMinorUnits" //
					type="text"
					aria-invalid={errors.priceInMinorUnits ? 'true' : 'false'}
					{...register('priceInMinorUnits')}
					className="w-full"
				/>
			</div>

			<div>
				<label htmlFor="vat" className="block mb-1">
					VAT percentage
				</label>
				<ErrorMessage error={errors.customVat} />
				<input
					id="customVat" //
					type="text"
					aria-invalid={errors.customVat ? 'true' : 'false'}
					{...register('customVat')}
					className="w-full"
				/>
			</div>

			<ErrorMessage error={errorMessage} />
			<div className="flex justify-center mt-8">
				<SubmitButton //
					content="Add item"
					formReady={isValid}
					isSubmitting={isSubmitting}
				/>
			</div>
		</form>
	)
}
