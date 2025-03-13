import type { BrowserSafeOrderMade, BrowserSafeOrderReceived } from '@/types'

export function calculateOrderTotal({
	orderDetails,
	includeVat,
}: { orderDetails: BrowserSafeOrderMade | BrowserSafeOrderReceived; includeVat: boolean }): number {
	if (orderDetails && includeVat) return 5
	return 10
}
