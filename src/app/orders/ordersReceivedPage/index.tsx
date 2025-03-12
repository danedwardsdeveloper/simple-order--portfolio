'use client'
import Spinner from '@/components/Spinner'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { useUser } from '@/providers/user'
import OrderReceivedCard from './components/OrderReceivedCard'

export default function OrdersReceivedPage() {
	const { user, isLoading, ordersReceived, inventory } = useUser()
	if (isLoading) return <Spinner />

	if (!user) return <UnauthorisedLinks />

	if (!ordersReceived)
		return <p className="lg:-mx-3 w-full text-blue-600 p-3 border-2 border-blue-300 bg-red-50 rounded-xl max-w-xl">No orders found</p>

	return (
		<>
			<ul className="flex flex-col gap-y-4 w-full max-w-xl">
				{ordersReceived?.map((order, index) => (
					<OrderReceivedCard key={order.id} orderDetails={order} index={index} />
				))}
			</ul>
			{/* Temporary data display */}
			{ordersReceived && (
				<>
					<h2 className="mt-8 mb-2">Orders received</h2>
					<p>{JSON.stringify(ordersReceived)}</p>
				</>
			)}

			{/* Temporary data display */}
			{inventory && (
				<>
					<h2 className="mt-8 mb-2">Inventory</h2>
					<p>{JSON.stringify(inventory)}</p>
				</>
			)}
		</>
	)
}
