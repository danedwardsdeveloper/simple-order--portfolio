'use client'
import { useUi } from '@/providers/ui'
import DynamicTitle from './components/DynamicTitle'
import OrdersMade from './components/OrdersMade'
import OrdersReceived from './components/OrdersReceived'

export default function OrdersPage() {
	const { merchantMode } = useUi()

	return (
		<>
			<DynamicTitle />
			{merchantMode ? <OrdersReceived /> : <OrdersMade />}
		</>
	)
}
