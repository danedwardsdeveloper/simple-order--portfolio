import MessageContainer from '@/components/MessageContainer'
import { pluralise } from '@/library/utilities/public'
import type { UserData } from '@/types'
import type { ReactNode } from 'react'

type Props = {
	ordersReceived: UserData['ordersReceived']
}

export default function OrdersSummaries(props: Props) {
	const { ordersReceived } = props

	function Container({ children }: { children: ReactNode }) {
		return (
			<>
				<h2>Summary</h2>
				<MessageContainer borderColour="border-blue-300">{children}</MessageContainer>
			</>
		)
	}

	if (!ordersReceived || ordersReceived.length === 0) {
		return (
			<Container>
				<p>No orders yet</p>
			</Container>
		)
	}

	const numberOfOrders = ordersReceived.length

	const unprocessedOrders = ordersReceived?.filter((order) => order.statusName === 'Pending')

	return (
		<Container>
			<p>{numberOfOrders} orders</p>
			<p>
				{unprocessedOrders.length} new {pluralise('order', unprocessedOrders)}
			</p>
		</Container>
	)
}
