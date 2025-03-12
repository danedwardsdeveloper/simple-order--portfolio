import ZebraContainer from '@/components/ZebraContainer'
import { formatDate, formatPrice } from '@/library/utilities'
import type { BrowserSafeOrderReceived } from '@/types'

interface Props {
	orderDetails: BrowserSafeOrderReceived
	index: number
}

export default function OrderReceivedCard({ orderDetails, index }: Props) {
	return (
		<li>
			<ZebraContainer index={index} oddStyles="bg-blue-50" evenStyles="bg-zinc-50" baseStyles="flex flex-col gap-y-2 w-full p-3 rounded-xl">
				<div className="flex justify-between">
					<h3>{orderDetails.customerBusinessName}</h3>
					<time
					// ToDo: add datetime={}
					>
						{formatDate(orderDetails.requestedDeliveryDate)}
					</time>
				</div>
				<ul className="flex-col gap-y-4">
					{orderDetails.items.map((item) => (
						<li key={item.id} className="flex gap-x-4">
							<span>{item.name}</span>
							<span>x {item.description}</span>
							<span>{formatPrice(item.priceInMinorUnits)}</span>
						</li>
					))}
				</ul>
			</ZebraContainer>
		</li>
	)
}
