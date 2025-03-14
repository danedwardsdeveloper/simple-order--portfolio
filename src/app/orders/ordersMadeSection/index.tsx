'use client'
import Spinner from '@/components/Spinner'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { useUi } from '@/providers/ui'
import { useUser } from '@/providers/user'
import MerchantsList from './components/MerchantsList'
import OrderMadeCard from './components/OrderMadeCard'

export default function OrdersMadeSection() {
	const { user, isLoading, ordersMade } = useUser()
	const { includeVat } = useUi()
	if (isLoading) return <Spinner />

	if (!user) return <UnauthorisedLinks />

	function OrdersMadeList() {
		if (!ordersMade) {
			return <p className="lg:-mx-3 w-full text-blue-600 p-3 border-2 border-blue-300 bg-blue-50 rounded-xl max-w-xl">No orders found</p>
		}

		return (
			<>
				<h2 className="mt-12 mb-4">Orders made</h2>
				<ul className="flex flex-col gap-y-4 w-full max-w-xl">
					{ordersMade?.map((order, index) => (
						<OrderMadeCard key={order.id} orderDetails={order} includeVat={includeVat} index={index} />
					))}
				</ul>
			</>
		)
	}

	return (
		<>
			{/* ToDo: create an orders/new with the merchants list incase this page gets too busy */}
			<MerchantsList />
			<OrdersMadeList />
		</>
	)
}
