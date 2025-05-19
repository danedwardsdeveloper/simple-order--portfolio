'use client'
import SubmitButton from '@/components/SubmitButton'
import { useUi } from '@/components/providers/ui'
import { formatPrice, mergeClasses } from '@/library/utilities/public'
import type { BrowserSafeMerchantProduct } from '@/types'
import { useState } from 'react'
import DeleteProductModal from './DeleteProductModal'

export type HandleDeleteProduct = (productId: number) => Promise<boolean>

interface Props {
	product: BrowserSafeMerchantProduct
	handleDelete: HandleDeleteProduct
	zebraStripe: boolean
	isDeleting: boolean
}

export default function InventoryCard({ product, handleDelete, isDeleting, zebraStripe }: Props) {
	const { includeVat } = useUi()

	const [showDeleteModal, setShowDeleteModal] = useState(false)
	const [isBeingEdited, setIsBeingEdited] = useState(false)

	const { name, priceInMinorUnits, customVat, description } = product

	function DisplayPrice(): string {
		if (!includeVat) return formatPrice(priceInMinorUnits)
		const vatMultiplier = 1 + customVat / 100
		return formatPrice(priceInMinorUnits * vatMultiplier)
	}

	function EditView() {
		return (
			<form>
				<div className="flex gap-x-4 justify-end">
					<button type="button" onClick={() => setIsBeingEdited(false)} className="button-secondary">
						Cancel
					</button>
					<SubmitButton formReady={false} isSubmitting={false} content="Save changes" />
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
				onConfirm={handleDelete}
				isDeleting={isDeleting}
			/>

			<li className={mergeClasses('flex flex-col gap-y-2 w-full p-3 rounded-xl', zebraStripe ? 'bg-blue-50' : 'bg-zinc-50')}>
				<h3 className="mb-1">{name}</h3>
				{isBeingEdited ? <EditView /> : <MainView />}
			</li>
		</>
	)
}
