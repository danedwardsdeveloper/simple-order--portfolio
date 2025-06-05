'use client'
import { SubmitButton } from '@/components/Buttons'
import FormFieldErrorMessage from '@/components/FormFieldErrorMessage'
import { useUi } from '@/components/providers/ui'
import { formatPrice, mergeClasses } from '@/library/utilities/public'
import { type InventoryUpdateFormData, inventoryUpdateFormSchema } from '@/library/validations'
import type { BrowserSafeMerchantProduct, InventoryContextType } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import DeleteProductModal from './DeleteProductModal'

export type InventoryCardProps = {
	product: BrowserSafeMerchantProduct
	zebraStripe: boolean
} & Pick<InventoryContextType, 'deleteProduct' | 'isDeleting' | 'updateProduct' | 'isUpdating'>

export default function InventoryCard({ product, zebraStripe, deleteProduct, isDeleting, updateProduct, isUpdating }: InventoryCardProps) {
	const { includeVat, currency } = useUi()

	const [showDeleteModal, setShowDeleteModal] = useState(false)
	const [isBeingEdited, setIsBeingEdited] = useState(false)

	const { name, priceInMinorUnits, customVat, description } = product

	function DisplayPrice(): string {
		if (!includeVat) return formatPrice(priceInMinorUnits, currency)
		const vatMultiplier = 1 + customVat / 100
		return formatPrice(priceInMinorUnits * vatMultiplier, currency)
	}

	function EditView() {
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
				isDirty: hasChanges,
			},
			reset,
		} = useForm<InventoryUpdateFormData>({
			resolver: zodResolver(inventoryUpdateFormSchema),
			mode: 'onChange',
			defaultValues: {
				name,
				description,
				priceInMinorUnits: String(priceInMinorUnits),
				customVat: String(customVat),
			},
		})

		// ToDo: when you submit the updated product it briefly displays a weird glitch

		async function onSubmit(updateData: InventoryUpdateFormData) {
			const success = await updateProduct(product, updateData)
			if (success) {
				setIsBeingEdited(false)
				reset()
			}
		}

		return (
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className="flex flex-col gap-y-4 mb-3">
					<div>
						<div className="mb-1">
							<label htmlFor="name" className="block  font-medium">
								Name
							</label>
							<FormFieldErrorMessage error={nameError} />
						</div>
						<input
							type="text" //
							id="name"
							{...register('name')}
							aria-invalid={nameError ? 'true' : 'false'}
							className="w-full"
						/>
					</div>

					<div>
						<label htmlFor="description" className="block  font-medium">
							Description
							<span className="ml-2 text-zinc-500 font-normal">optional</span>
						</label>
						<FormFieldErrorMessage error={descriptionError} />
						<textarea
							id="description" //
							{...register('description')}
							aria-invalid={descriptionError ? 'true' : 'false'}
							className="w-full"
						/>
					</div>

					<div>
						<label htmlFor="price" className="block  font-medium">
							Price in pence
						</label>
						<FormFieldErrorMessage error={priceInMinorUnitsError} />
						<input
							type="number" //
							id="price"
							{...register('priceInMinorUnits')}
							aria-invalid={priceInMinorUnitsError ? 'true' : 'false'}
							className="w-full"
						/>
					</div>

					<div>
						<label htmlFor="vat" className="block  font-medium">
							VAT %
						</label>
						<input type="number" id="vat" {...register('customVat')} aria-invalid={customVatError ? 'true' : 'false'} className="w-full" />
					</div>
				</div>

				<div className="flex gap-x-4 justify-end h-min items-end">
					<button type="button" onClick={() => setIsBeingEdited(false)} className="button-secondary h-min w-1/2">
						<p className="min-h-7">Cancel</p>
					</button>
					<SubmitButton //
						formReady={hasChanges && isValid}
						isSubmitting={isUpdating}
						content="Save changes"
						classes="w-1/2"
					/>
				</div>
			</form>
		)
	}

	function MainView() {
		return (
			<>
				<h3 className="mb-1">{name}</h3>
				<p className="text-zinc-700">{description}</p>
				{includeVat && <p className="text-zinc-700">{customVat}% VAT</p>}
				<div className="flex justify-between items-center">
					<div className="flex gap-x-1 items-center">
						<span className="text-lg">
							<DisplayPrice />
						</span>
						<span className="text-zinc-500">{includeVat && `Including ${customVat}% VAT`}</span>
					</div>
					<div className="flex gap-x-4">
						<button type="button" className="link-danger" onClick={() => setShowDeleteModal(true)}>
							Delete...
						</button>
						<button type="button" className="link-primary" onClick={() => setIsBeingEdited(true)}>
							Edit
						</button>
					</div>
				</div>
			</>
		)
	}

	return (
		<>
			<DeleteProductModal
				product={product}
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				onConfirm={deleteProduct}
				isDeleting={isDeleting}
			/>

			<li className={mergeClasses('flex flex-col gap-y-2 w-full p-3 rounded-xl', zebraStripe ? 'bg-blue-50' : 'bg-zinc-50')}>
				{isBeingEdited ? <EditView /> : <MainView />}
			</li>
		</>
	)
}
