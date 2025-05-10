import type { BrowserOrderItem } from '@/types'

export function calculateOrderTotal(orderItems: BrowserOrderItem[]): {
	totalWithVAT: number
	totalWithoutVAT: number
} {
	let totalWithVAT = 0
	let totalWithoutVAT = 0

	for (const item of orderItems) {
		const subtotalWithoutVat = item.priceInMinorUnitsWithoutVat * item.quantity

		totalWithoutVAT += subtotalWithoutVat

		const vatMultiplier = item.vat <= 1 ? item.vat : item.vat / 100
		const vatAmount = subtotalWithoutVat * vatMultiplier
		totalWithVAT += subtotalWithoutVat + vatAmount
	}

	return { totalWithVAT, totalWithoutVAT }
}
