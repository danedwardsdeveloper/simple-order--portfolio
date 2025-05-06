import type { OrderStatusName } from '@/types'

export default function OrderStatusComponent({ orderStatusName }: { orderStatusName: OrderStatusName }) {
	const colourClass = (() => {
		switch (orderStatusName) {
			case 'Cancelled':
				return 'text-red-600'
			case 'Completed':
				return 'text-green-600'
			default: // 'Pending'
				return 'text-orange-600'
		}
	})()

	return <span className={colourClass}>{orderStatusName}</span>
}
