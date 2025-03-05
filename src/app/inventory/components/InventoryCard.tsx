'use client'
import type { InventoryDELETEbody, InventoryDELETEresponse } from '@/app/api/inventory/admin/[itemId]/route'
import logger from '@/library/logger'
import { formatPrice } from '@/library/utilities'
import { useNotifications } from '@/providers/notifications'
import { useUi } from '@/providers/ui'
import { useUser } from '@/providers/user'
import type { BrowserSafeMerchantProduct } from '@/types'
import clsx from 'clsx'
import { useState } from 'react'
import DeleteProductModal from './DeleteProductModal'

interface Props {
	product: BrowserSafeMerchantProduct
	zebraStripe: boolean
}

export default function InventoryCard({ product, zebraStripe }: Props) {
	const { vat } = useUser()
	const [showDeleteModal, setShowDeleteModal] = useState(false)
	const { createNotification } = useNotifications()
	const [isBeingEdited, setIsBeingEdited] = useState(false)
	const { includeVat } = useUi()

	const vatInteger = product.customVat ?? vat

	function DisplayPrice(): string {
		if (!includeVat) return formatPrice(product.priceInMinorUnits)
		const vatMultiplier = 1 + vatInteger / 100
		return formatPrice(product.priceInMinorUnits * vatMultiplier)
	}

	if (isBeingEdited) {
		return (
			<li className={clsx('flex flex-col gap-y-2 w-full p-3 rounded-xl', zebraStripe ? 'bg-blue-50' : 'bg-zinc-50')}>
				<h1>{`I'm being edited!`}</h1>
				<button type="button" onClick={() => setIsBeingEdited(false)} className="button-secondary">
					Cancel
				</button>
			</li>
		)
	}

	async function handleDelete() {
		const body: InventoryDELETEbody = {
			productToDeleteId: product.id,
		}

		const response = await fetch('ToDo!', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		})

		const { message }: InventoryDELETEresponse = await response.json()
		if (message === 'success') {
			// ToDo: delete the product from the context

			createNotification({
				title: 'Success',
				level: 'success',
				message: `${product.name} deleted`,
			})
			return
		}
		logger.error('Product not deleted')
		createNotification({
			title: 'Error',
			level: 'error',
			message: `Failed to delete ${product.name}`,
		})
		return
	}

	return (
		<>
			<DeleteProductModal
				product={product}
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				onConfirm={() => handleDelete()}
			/>
			<li className={clsx('flex flex-col gap-y-2 w-full p-3 rounded-xl', zebraStripe ? 'bg-blue-50' : 'bg-zinc-50')}>
				<h3 className="mb-1">{product.name}</h3>
				<p className="text-zinc-700 max-w-prose">{product.description}</p>
				<div className="flex justify-between items-center">
					<div className="flex gap-x-1 items-center">
						<span className="text-lg">
							<DisplayPrice />
						</span>
						<span className="text-zinc-500 text-sm">{includeVat && `Including ${vatInteger}% VAT`}</span>
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
			</li>
		</>
	)
}
