import { dataTestIdNames } from '@/library/constants'
import { formatPrice, mergeClasses } from '@/library/utilities'
import type { BrowserSafeCustomerProduct } from '@/types'

interface Props {
	product: BrowserSafeCustomerProduct
	quantity: number
	onQuantityChange: (quantity: number) => void
	zebraStripe: boolean
}

export default function CustomerFacingProductCard({ product, quantity, onQuantityChange, zebraStripe }: Props) {
	return (
		<li
			data-test-id={dataTestIdNames.merchants.customerFacingProductCard}
			className={mergeClasses('flex flex-col gap-y-2 w-full p-3 rounded-xl', zebraStripe ? 'bg-blue-50' : 'bg-zinc-50')}
		>
			<h3 className="text-xl font-medium mb-1">{product.name}</h3>
			<p className="text-zinc-700 max-w-prose">{product.description}</p>
			<div className="flex justify-between items-center">
				<div className="flex gap-x-1 items-center">
					<span className="text-lg">{formatPrice(product.priceInMinorUnits)}</span>
				</div>
				<div>
					<label htmlFor="quantity" className="text-zinc-600">
						Quantity
					</label>
					<input
						id="quantity"
						type="number"
						min="0"
						max="1000"
						value={quantity}
						onChange={(event) => onQuantityChange(Number.parseInt(event.target.value) || 0)}
					/>
				</div>
			</div>
		</li>
	)
}
