import { formatPrice, mergeClasses } from '@/library/utilities/public'
import type { BrowserSafeCustomerProduct } from '@/types'
import type { UiContextData } from '@/types/definitions/contexts/ui'
import type { ChangeEvent, KeyboardEvent } from 'react'

interface Props {
	product: BrowserSafeCustomerProduct
	quantity: string
	onQuantityChange: (quantity: string) => void
	zebraStripe: boolean
	currency: UiContextData['currency']
}

export default function ProductInput({ product, quantity, onQuantityChange, zebraStripe, currency }: Props) {
	function handleQuantityChange(event: ChangeEvent<HTMLInputElement>) {
		const value = event.target.value

		if (value === '') {
			onQuantityChange('')
			return
		}

		const digitsOnlyRegex = /^\d+$/
		if (!digitsOnlyRegex.test(value)) return

		onQuantityChange(value)
	}

	function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
			event.preventDefault()

			const currentValue = quantity === '' ? 0 : Number.parseInt(quantity, 10)

			if (event.key === 'ArrowUp') {
				onQuantityChange(String(currentValue + 1))
			} else if (event.key === 'ArrowDown' && currentValue > 0) {
				onQuantityChange(String(currentValue - 1))
			}
		}
	}

	return (
		<li className={mergeClasses('flex flex-col gap-y-2 w-full p-3 rounded-xl', zebraStripe ? 'bg-blue-50' : 'bg-zinc-50')}>
			<h3 className="text-xl font-medium mb-1">{product.name}</h3>
			<p className="text-zinc-700 max-w-prose">{product.description}</p>
			<div className="mt-4 flex justify-between items-end">
				<div className="flex gap-x-1 items-center">
					<span className="text-lg">{formatPrice(product.priceInMinorUnits, currency)}</span>
				</div>
				<div>
					<label htmlFor={`quantity-${product.id}`} className="text-zinc-600">
						Quantity
					</label>
					<input
						id={`quantity-${product.id}`}
						type="text"
						value={quantity}
						inputMode="numeric"
						onChange={handleQuantityChange}
						onKeyDown={handleKeyDown}
						pattern="[0-9]*"
						min="0"
						placeholder="0"
						className="w-20"
						autoComplete="off"
					/>
				</div>
			</div>
		</li>
	)
}
