import { formatDate, formatPrice } from '@/library/utilities'
import type { BrowserSafeMerchantFacingOrder } from '@/types'
import clsx from 'clsx'

interface Props {
	order: BrowserSafeMerchantFacingOrder
	zebraStripe: boolean
}

export default function OrderSummary({ order, zebraStripe }: Props) {
	return (
		<li className={clsx('flex flex-col gap-y-2 w-full p-3 rounded-xl', zebraStripe ? 'bg-blue-50' : 'bg-zinc-50')}>
			<div className="flex justify-between">
				<h3>{order.customerBusinessName}</h3>
				<time
				// ToDo: add datetime={}
				>
					{formatDate(order.requestedDeliveryDate)}
				</time>
			</div>
			<ul className="flex-col gap-y-4">
				{order.items.map((item) => (
					<li key={item.id} className="flex gap-x-4">
						<span>{item.name}</span>
						<span>x {item.description}</span>
						<span>{formatPrice(item.priceInMinorUnits)}</span>
					</li>
				))}
			</ul>
		</li>
	)
}
