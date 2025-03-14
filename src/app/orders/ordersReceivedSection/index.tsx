'use client'
import Spinner from '@/components/Spinner'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { useUi } from '@/providers/ui'
import { useUser } from '@/providers/user'
import OrderReceivedCard from './components/OrderReceivedCard'

export default function OrdersReceivedSection() {
	const { user, isLoading, ordersReceived } = useUser()
	const { includeVat } = useUi()
	if (isLoading) return <Spinner />

	if (!user) return <UnauthorisedLinks />

	if (!ordersReceived)
		return <p className="lg:-mx-3 w-full text-blue-600 p-3 border-2 border-blue-300 bg-blue-50 rounded-xl max-w-xl">No orders found</p>

	return (
		<>
			<ul className="flex flex-col gap-y-4 w-full max-w-xl">
				{ordersReceived?.map((order, index) => (
					<OrderReceivedCard key={order.id} orderDetails={order} includeVat={includeVat} index={index} />
				))}
			</ul>
		</>
	)
}
