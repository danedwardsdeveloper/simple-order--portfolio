import ZebraContainer from '@/components/ZebraContainer'
import { capitaliseFirstLetter, formatDate } from '@/library/utilities'
import type { OrderMade } from '@/types'

interface Props {
	orderDetails: OrderMade
	includeVat: boolean
	index: number
}

export default function OrderMadeCard({ orderDetails, includeVat, index }: Props) {
	return (
		<li>
			<ZebraContainer index={index} oddStyles="bg-blue-50" evenStyles="bg-zinc-50" baseStyles="flex flex-col gap-y-6 w-full p-3 rounded-xl">
				<div className="flex justify-between">
					<h3>{orderDetails.businessName}</h3>
					<div className="flex flex-col gap-y-2 justify-end text-right">
						<span className="text-orange-600">{capitaliseFirstLetter(orderDetails.status)}</span>
						<div className="block">
							<span className="text-zinc-600 mr-2">Requested delivery date</span>
							<time dateTime={orderDetails.requestedDeliveryDate.toString()}>{formatDate(orderDetails.requestedDeliveryDate)}</time>
						</div>

						<div className="block">
							<span className="text-zinc-600 mr-2">Created</span>
							<time dateTime={orderDetails.createdAt.toString()}>{formatDate(orderDetails.createdAt)}</time>
						</div>

						{orderDetails.createdAt !== orderDetails.updatedAt && (
							<div className="block">
								<span className="text-zinc-600 mr-2">Updated</span>
								<time dateTime={orderDetails.updatedAt.toString()}>{formatDate(orderDetails.updatedAt)}</time>
							</div>
						)}
					</div>
				</div>
				<div className="">
					{JSON.stringify(orderDetails)}
					{includeVat}
					{index}
				</div>
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
