import type { OrderMade, OrderReceived } from '@/types'

export function calculateOrderTotal({
	orderDetails,
	includeVat,
}: { orderDetails: OrderMade | OrderReceived; includeVat: boolean }): number {
	let total = 0
	for (const product of orderDetails.products) {
		const subtotalWithoutVat = product.priceInMinorUnitsWithoutVat * product.quantity
		if (includeVat) {
			const vatMultiplier = product.vat <= 1 ? product.vat : product.vat / 100
			const vatAmount = subtotalWithoutVat * vatMultiplier
			total += subtotalWithoutVat + vatAmount
		} else {
			total += subtotalWithoutVat
		}
	}

	return total
}
