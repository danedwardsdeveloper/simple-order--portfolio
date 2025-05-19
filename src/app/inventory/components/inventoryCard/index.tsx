'use client'
import SubmitButton from '@/components/SubmitButton'
import type { HandleDeleteProduct, HandleUpdateProduct } from '@/components/providers/inventory'
import { useUi } from '@/components/providers/ui'
import { formatPrice, mergeClasses } from '@/library/utilities/public'
import type { BrowserSafeMerchantProduct } from '@/types'
import { type FormEvent, useState } from 'react'
import DeleteProductModal from '../DeleteProductModal'

export interface InventoryCardProps {
	product: BrowserSafeMerchantProduct
	zebraStripe: boolean

	// Drilled props
	deleteProduct: HandleDeleteProduct
	isDeleting: boolean
	updateProduct: HandleUpdateProduct
	isUpdating: boolean
}

export default function InventoryCard({ product, zebraStripe, deleteProduct, isDeleting, updateProduct, isUpdating }: InventoryCardProps) {
	const { includeVat } = useUi()

	const [showDeleteModal, setShowDeleteModal] = useState(false)
	const [isBeingEdited, setIsBeingEdited] = useState(false)
	const [hasChanges, setHasChanges] = useState(false)
	const [editedProduct, setEditedProduct] = useState(product)

	const { name, priceInMinorUnits, customVat, description } = product

	function DisplayPrice(): string {
		if (!includeVat) return formatPrice(priceInMinorUnits)
		const vatMultiplier = 1 + customVat / 100
		return formatPrice(priceInMinorUnits * vatMultiplier)
	}

	function handleInputChange(field: keyof BrowserSafeMerchantProduct, value: string | number) {
		setEditedProduct((prev) => {
			const updated = { ...prev, [field]: value }
			setHasChanges(JSON.stringify(updated) !== JSON.stringify(product))
			return updated
		})
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault()
		const success = await updateProduct(editedProduct)
		if (success) {
			setIsBeingEdited(false)
			setHasChanges(false)
		}
	}

	function EditView() {
		return (
			<form onSubmit={handleSubmit}>
				<div className="flex flex-col gap-y-3 mb-3">
					<div>
						<label htmlFor="productName" className="block  font-medium">
							Product name
						</label>
						<input
							type="text"
							id="productName"
							value={editedProduct.name}
							onChange={(e) => handleInputChange('name', e.target.value)}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
						/>
					</div>

					<div>
						<label htmlFor="description" className="block  font-medium">
							Description
						</label>
						<textarea
							id="description"
							value={editedProduct.description || ''}
							onChange={(event) => handleInputChange('description', event.target.value)}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:"
						/>
					</div>

					<div>
						<label htmlFor="price" className="block  font-medium">
							Price (in pence)
						</label>
						<input
							type="number"
							id="price"
							value={editedProduct.priceInMinorUnits}
							onChange={(event) => handleInputChange('priceInMinorUnits', Number.parseInt(event.target.value, 10))}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:"
						/>
					</div>

					<div>
						<label htmlFor="vat" className="block  font-medium">
							VAT %
						</label>
						<input
							type="number"
							id="vat"
							value={editedProduct.customVat}
							onChange={(event) => handleInputChange('customVat', Number.parseInt(event.target.value, 10))}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:"
						/>
					</div>
				</div>

				<div className="flex gap-x-4 justify-end">
					<button type="button" onClick={() => setIsBeingEdited(false)} className="button-secondary">
						Cancel
					</button>
					{hasChanges && <SubmitButton formReady={hasChanges} isSubmitting={isUpdating} content="Save changes" />}
				</div>
			</form>
		)
	}

	function MainView() {
		return (
			<>
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
				<h3 className="mb-1">{name}</h3>
				{isBeingEdited ? <EditView /> : <MainView />}
			</li>
		</>
	)
}
