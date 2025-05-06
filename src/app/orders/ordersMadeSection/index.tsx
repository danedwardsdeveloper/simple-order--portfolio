'use client'
import Spinner from '@/components/Spinner'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { useUi } from '@/components/providers/ui'
import { useUser } from '@/components/providers/user'
import OrderMadeCard from './components/OrderMadeCard'

export default function OrdersMadeSection() {
	const { user, isLoading, ordersMade } = useUser()
	const { includeVat } = useUi()
	if (isLoading) return <Spinner />

	if (!user) return <UnauthorisedLinks />

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
