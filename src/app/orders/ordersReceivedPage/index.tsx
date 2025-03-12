'use client'
import Spinner from '@/components/Spinner'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { useUser } from '@/providers/user'
import {} from 'react'
import OrderSummary from './components/OrderSummary'

export default function OrdersReceivedPage() {
	const { user, isLoading, ordersReceived } = useUser()
	if (isLoading) return <Spinner />

	if (!user) return <UnauthorisedLinks />

	if (!ordersReceived)
		return <p className="lg:-mx-3 w-full text-blue-600 p-3 border-2 border-blue-300 bg-red-50 rounded-xl max-w-xl">No orders found</p>

	return (
		<ul className="flex flex-col gap-y-4 w-full max-w-xl">
			{ordersReceived?.map((order, index) => (
				<OrderSummary key={order.id} order={order} zebraStripe={Boolean(index % 2)} />
			))}
		</ul>
	)
}
