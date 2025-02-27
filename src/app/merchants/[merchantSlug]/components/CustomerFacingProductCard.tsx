import { dataTestIdNames } from '@/library/constants'
import { formatPrice } from '@/library/utilities'
import type { BrowserSafeCustomerProduct } from '@/types'
import clsx from 'clsx'

interface Props {
	product: BrowserSafeCustomerProduct
	zebraStripe: boolean
}

export default function CustomerFacingProductCard({ product, zebraStripe }: Props) {
	return (
		<li
			data-test-id={dataTestIdNames.merchants.customerFacingProductCard}
			className={clsx('flex flex-col gap-y-2 w-full p-3 rounded-xl', zebraStripe ? 'bg-blue-50' : 'bg-zinc-50')}
		>
			<h3 className="text-xl font-medium mb-1">{product.name}</h3>
			<p className="text-zinc-700 max-w-prose">{product.description}</p>
			<div className="flex justify-between items-center">
				<div className="flex gap-x-1 items-center">
					{/* ToDo: format the price properly */}
					<span className="text-lg">{formatPrice(product.priceInMinorUnits)}</span>
				</div>
			</div>
		</li>
	)
}
