import ZebraContainer from '@/components/ZebraContainer'
import { calculateOrderTotal, formatDate, formatPrice } from '@/library/utilities/public'
import type { BrowserOrderItem, OrderMade } from '@/types'
import OrderStatusIcon from '../OrderStatusIcon'

interface Props {
	orderDetails: OrderMade
	includeVat: boolean
	index: number
}

function OrderItem({ item }: { item: BrowserOrderItem }) {
	return (
		<li key={item.id} className="flex flex-col pt-6 first:pt-4">
			{/* Item heading */}
			<div className="flex justify-between mb-3">
				<span className="text-xl">{item.name}</span>
				<div>
					<span className="text-zinc-600">x </span>
					<span className="text-xl">{item.quantity}</span>
				</div>
			</div>

			{/* Item body */}
			<div className="flex justify-between text-zinc-700">
				<span>{formatPrice(item.priceInMinorUnitsWithoutVat)} each</span>
				<span>Item subtotal {formatPrice(item.priceInMinorUnitsWithoutVat * item.quantity)}</span>
			</div>
		</li>
	)
}

export default function OrderMadeCard({ orderDetails, includeVat, index }: Props) {
	const { statusName, businessName, requestedDeliveryDate, createdAt, updatedAt, products } = orderDetails

	const { totalWithVAT, totalWithoutVAT } = calculateOrderTotal(orderDetails.products)

	const formattedTotal = formatPrice(includeVat ? totalWithVAT : totalWithoutVAT)

	return (
		<li>
			<ZebraContainer index={index}>
				{/* Card header */}
				<div className="flex justify-between">
					<h3>{businessName}</h3>
					<OrderStatusIcon status={statusName} />
				</div>
				<div className="flex justify-end">
					<div className="flex flex-col gap-y-2 justify-end text-right">
						<div className="block">
							<span className="text-zinc-600 mr-2">Requested delivery date</span>
							<time dateTime={requestedDeliveryDate.toString()}>{formatDate(requestedDeliveryDate)}</time>
						</div>

						<div className="block">
							<span className="text-zinc-600 mr-2">Created</span>
							<time dateTime={createdAt.toString()}>{formatDate(createdAt)}</time>
						</div>

						{createdAt !== updatedAt && (
							<div className="block">
								<span className="text-zinc-600 mr-2">Updated</span>
								<time dateTime={updatedAt.toString()}>{formatDate(updatedAt)}</time>
							</div>
						)}
					</div>
				</div>

				{/* Order items */}
				<ul className="flex flex-col gap-y-6 divide-y-2 divide-zinc-200 mb-8">
					{products.map((item) => (
						<OrderItem key={item.id} item={item} />
					))}
				</ul>

				{/* Order total */}
				<div className="w-full flex gap-x-3 items-end justify-end text-xl">
					<span className="text-zinc-600">Total</span>
					<span className="font-medium">{formattedTotal}</span>
				</div>

				{/* Action buttons */}
				<div className="flex justify-end gap-x-4">
					<button type="button" className="link-danger">
						Cancel...
					</button>
					<button type="button" className="link-primary">
						Edit
					</button>
				</div>
			</ZebraContainer>
		</li>
	)
}
