import { formatDate, formatPrice } from '@/library/utilities'
import type { BrowserSafeOrder } from '@/types'
import clsx from 'clsx'

interface Props {
	order: BrowserSafeOrder
	zebraStripe: boolean
}

export default function OrderSummary({ order, zebraStripe }: Props) {
	return (
		<li className={clsx('flex flex-col gap-y-2 w-full p-3 rounded-xl', zebraStripe ? 'bg-blue-50' : 'bg-zinc-50')}>
			<div className="flex justify-between">
				<h3>{order.customerBusinessName || 'Customer name missing'}</h3>
				<time
				// ToDo: add datetime={}
				>
					{formatDate(order.requestedDeliveryDate)}
				</time>
			</div>
			<ul className="flex-col gap-y-4">
				{order.items.map((item) => (
					<li key={item.id} className="flex gap-x-4">
						<span>{item.productId}</span>
						<span>x {item.quantity}</span>
						<span>{formatPrice(item.priceInMinorUnitsWithoutVat)}</span>
					</li>
				))}
			</ul>
		</li>
	)
}
