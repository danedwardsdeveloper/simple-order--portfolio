import ZebraContainer from '@/components/ZebraContainer'
import { orderStatus } from '@/library/constants'
import { calculateOrderTotal, formatDate, formatPrice } from '@/library/utilities/public'
import type { OrderReceived, OrderStatus } from '@/types'
import OrderStatusDropdown from './OrderStatusDropdown'

interface Props {
	orderDetails: OrderReceived
	onStatusChangeRequest: (orderId: number, currentStatus: OrderStatus, newStatus: OrderStatus) => void
	includeVat: boolean
	index: number // Calculate the zebra stripe
}

export default function OrderReceivedCard({ orderDetails, includeVat, index, onStatusChangeRequest }: Props) {
	return (
		<li>
			<ZebraContainer
				index={index}
				oddStyles="bg-blue-50 border-blue-100"
				evenStyles="bg-zinc-50 border-zinc-100"
				baseStyles="flex flex-col gap-y-6 w-full p-4 border-2 rounded-xl"
			>
				{/* Order heading */}
				<div className="flex justify-between">
					<h3>{orderDetails.businessName}</h3>
					<div className="flex gap-x-3">
						<time dateTime={orderDetails.requestedDeliveryDate.toString()}>{formatDate(orderDetails.requestedDeliveryDate)}</time>
						<OrderStatusDropdown
							statusOptions={[orderStatus.pending, orderStatus.completed]}
							currentStatus={orderDetails.status}
							onStatusChange={(newStatus) => onStatusChangeRequest(orderDetails.id, orderDetails.status, newStatus)}
						/>
					</div>
				</div>
				{/* Merchant note */}
				<div>
					<h4 className="font-medium">Private note</h4>
					<p>{orderDetails.adminOnlyNote ? orderDetails.adminOnlyNote : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}</p>
				</div>

				{/* Customer note */}
				<div>
					<h4 className="font-medium">Customer note</h4>
					<p>{orderDetails.customerNote ? orderDetails.customerNote : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}</p>
				</div>

				{/* Order items */}
				<ul className="flex flex-col gap-y-6 divide-y-2 divide-zinc-200">
					{orderDetails.products.map((item) => (
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
								<span>Subtotal {formatPrice(item.priceInMinorUnitsWithoutVat * item.quantity)}</span>
							</div>
						</li>
					))}
				</ul>
				{/* Order total */}
				<div className="w-full flex gap-x-3 items-end justify-end text-xl">
					<span className="text-zinc-600">Total</span>
					<span className="font-medium">{formatPrice(calculateOrderTotal({ orderDetails, includeVat }))}</span>
				</div>
			</ZebraContainer>
		</li>
	)
}
