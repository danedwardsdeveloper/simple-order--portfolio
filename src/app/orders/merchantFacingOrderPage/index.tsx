'use client'
import type { OrdersAdminGETresponse } from '@/app/api/orders/admin/route'
import Spinner from '@/components/Spinner'
import { apiPaths } from '@/library/constants'
import type { BrowserSafeOrder } from '@/types'
import { useEffect, useState } from 'react'
import OrderSummary from './components/OrderSummary'

export default function MerchantFacingOrdersPage() {
	const [isLoading, setIsLoading] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [orders, setOrders] = useState<BrowserSafeOrder[] | null>(null)

	// biome-ignore lint/correctness/useExhaustiveDependencies: <run on mount>
	useEffect(() => {
		async function getOrders() {
			try {
				setIsLoading(true)
				setErrorMessage('')
				const response = await fetch(apiPaths.orders.merchantPerspective.base, { credentials: 'include' })
				const { orders, message }: OrdersAdminGETresponse = await response.json()

				if (response.ok) {
					if (orders) {
						setOrders(orders)
					} else {
						setErrorMessage(message)
					}
				}
				if (!response.ok) {
					setErrorMessage(message)
				}
			} catch {
				setErrorMessage('Failed to get orders')
			} finally {
				setIsLoading(false)
			}
		}
		if (!orders) getOrders()
	}, [])

	if (isLoading) return <Spinner />

	// ToDo: make this better
	if (errorMessage) return <p className="-mx-3 text-red-600 p-3 border-2 border-red-300 bg-red-50 rounded-xl max-w-xl">{errorMessage}</p>

	// ToDo: Make this better
	if (!orders) return <p>No orders found</p>

	return (
		<ul className="flex flex-col gap-y-4 w-full max-w-xl">
			{orders?.map((order, index) => (
				<OrderSummary key={order.id} order={order} zebraStripe={Boolean(index % 2)} />
			))}
		</ul>
	)
}
