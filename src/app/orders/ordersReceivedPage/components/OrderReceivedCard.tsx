import ZebraContainer from '@/components/ZebraContainer'
import { calculateOrderTotal, capitaliseFirstLetter, formatDate, formatPrice } from '@/library/utilities'
import type { OrderReceived } from '@/types'

interface Props {
	orderDetails: OrderReceived
	includeVat: boolean
	index: number // Number for calculating the zebra stripe colour
}

export default function OrderReceivedCard({ orderDetails, includeVat, index }: Props) {
	return (
		<li>
			<ZebraContainer index={index} oddStyles="bg-blue-50" evenStyles="bg-zinc-50" baseStyles="flex flex-col gap-y-6 w-full p-3 rounded-xl">
				<div className="flex justify-between">
					<h3>{orderDetails.customerBusinessName}</h3>
					<div className="flex gap-x-3">
						<span className="text-orange-600">{capitaliseFirstLetter(orderDetails.status)}</span>
						<time
						// ToDo: add datetime={}
						>
							{formatDate(orderDetails.requestedDeliveryDate)}
						</time>
					</div>
				</div>
				<ul className="flex-col gap-y-4">
					{orderDetails.products.map((item) => (
						<li key={item.id} className="flex gap-x-4">
							<span>
								{item.name}
								<span className="text-zinc-600"> x </span>
								{item.vat},
							</span>
							<span>{formatPrice(item.priceInMinorUnitsWithoutVat)} each,</span>
							<span>{formatPrice(item.priceInMinorUnitsWithoutVat * item.quantity)} subtotal</span>
						</li>
					))}
				</ul>
				{/* Add customer note */}
				{/* Add merchant note */}
				<div className="w-full flex gap-x-3 items-end justify-end text-xl">
					<span className="text-zinc-600">Total</span>
					<span className="font-medium">{formatPrice(calculateOrderTotal({ orderDetails, includeVat }))}</span>
				</div>
			</ZebraContainer>
		</li>
	)
}
