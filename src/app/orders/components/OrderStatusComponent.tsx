import { capitaliseFirstLetter } from '@/library/utilities'
import type { OrderStatus } from '@/types'

export default function OrderStatusComponent({ orderStatus }: { orderStatus: OrderStatus }) {
	const colourClass = orderStatus === 'completed' ? 'text-green-600' : orderStatus === 'pending' ? 'text-orange-600' : 'text-red-600'
	return <span className={colourClass}>{capitaliseFirstLetter(orderStatus)}</span>
}
