import ZebraContainer from '@/components/ZebraContainer'
import { capitaliseFirstLetter, formatDate, formatPrice } from '@/library/utilities'
import type { BrowserSafeOrderReceived } from '@/types'

interface Props {
	orderDetails: BrowserSafeOrderReceived
	index: number // Number for calculating the zebra stripe colour
}

export default function OrderReceivedCard({ orderDetails, index }: Props) {
	return (
		<li>
			<ZebraContainer index={index} oddStyles="bg-blue-50" evenStyles="bg-zinc-50" baseStyles="flex flex-col gap-y-6 w-full p-3 rounded-xl">
				<div className="flex justify-between">
					<h3>{orderDetails.customerBusinessName}</h3>
					<div className="flex gap-x-2">
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
				<div className="w-full flex gap-x-2 items-end justify-end">
					<span className="text-xl font-medium">Total</span>
					<span>£666</span>
				</div>
			</ZebraContainer>
		</li>
	)
}
