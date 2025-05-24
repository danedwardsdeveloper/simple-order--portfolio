'use client'
import SubmitButton from '@/components/Buttons'
import FormFieldErrorMessage from '@/components/FormFieldErrorMessage'
import { serviceConstraints } from '@/library/constants'
import { type InventoryAddFormData, inventoryAddFormInputSchema } from '@/library/validations'
import type { BrowserSafeMerchantProduct } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

export interface AddInventoryFormProps {
	inventory: BrowserSafeMerchantProduct[] | null
	vat: number
	addProduct: (formData: InventoryAddFormData) => Promise<boolean>
	isSubmitting: boolean
}

export default function AddInventoryForm({ inventory, vat, addProduct, isSubmitting }: AddInventoryFormProps) {
	const {
		register,
		handleSubmit,
		formState: {
			errors: {
				name: nameError, //
				description: descriptionError,
				priceInMinorUnits: priceInMinorUnitsError,
				customVat: customVatError,
			},
			isValid,
		},
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
		const success = await addProduct(data)
		if (success) {
			reset()
			return
		}
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="p-4 border-2 border-zinc-200 rounded-xl flex flex-col gap-y-4 max-w-xl lg:-mx-3">
			<h2>Add an item</h2>

			<div>
				<div className="mb-1">
					<label htmlFor="name">Name</label>
					<FormFieldErrorMessage error={nameError} />
				</div>
				<input
					id="name" //
					type="text"
					{...register('name')}
					aria-invalid={nameError ? 'true' : 'false'}
					className="w-full"
				/>
			</div>

			<div>
				<label htmlFor="description" className="block mb-1">
					Description
					<span className="ml-2 text-zinc-500">optional</span>
				</label>
				<FormFieldErrorMessage error={descriptionError} />
				<input
					id="description" //
					type="text"
					{...register('description')}
					aria-invalid={descriptionError ? 'true' : 'false'}
					className="w-full"
				/>
			</div>

			<div>
				<label htmlFor="price" className="block mb-1">
					Price in pence
				</label>
				<FormFieldErrorMessage error={priceInMinorUnitsError} />
				<input
					id="priceInMinorUnits" //
					type="text"
					aria-invalid={priceInMinorUnitsError ? 'true' : 'false'}
					{...register('priceInMinorUnits')}
					className="w-full"
				/>
			</div>

			<div>
				<label htmlFor="vat" className="block mb-1">
					VAT percentage
				</label>
				<FormFieldErrorMessage error={customVatError} />
				<input
					id="customVat" //
					type="text"
					aria-invalid={customVatError ? 'true' : 'false'}
					{...register('customVat')}
					className="w-full"
				/>
			</div>

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
