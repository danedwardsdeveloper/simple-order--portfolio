'use client'
import { useUi } from '@/components/providers/ui'
import type { OrdersPageContentProps } from '../Content'
import OrderMadeCard from './OrderMadeCard'

type Props = Pick<OrdersPageContentProps, 'ordersMade'>

export default function OrdersMadeSection({ ordersMade }: Props) {
	const { includeVat } = useUi()

	if (!ordersMade) {
		return <p className="lg:-mx-3 w-full text-blue-600 p-3 border-2 border-blue-300 bg-blue-50 rounded-xl max-w-xl">No orders found</p>
	}

	return (
		<ul className="flex flex-col gap-y-4 w-full max-w-xl">
			{ordersMade
				.sort((a, b) => {
					const dateA = new Date(a.requestedDeliveryDate)
					const dateB = new Date(b.requestedDeliveryDate)
					return dateB.getTime() - dateA.getTime()
				})
				.map((order, index) => (
					<OrderMadeCard key={order.id} orderDetails={order} includeVat={includeVat} index={index} />
				))}
		</ul>
	)
}
