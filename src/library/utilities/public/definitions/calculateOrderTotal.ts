import { serviceConstraints } from '@/library/constants'
import type { BrowserOrderItem } from '@/types'

// Add maximum order quantity exceeded
export function calculateOrderTotal(orderItems: BrowserOrderItem[]): {
	totalWithVAT: number
	totalWithoutVAT: number
	maximumOrderValueExceeded: boolean
} {
	let totalWithVAT = 0
	let totalWithoutVAT = 0
	let maximumOrderValueExceeded = false

	for (const item of orderItems) {
		const subtotalWithoutVat = item.priceInMinorUnitsWithoutVat * item.quantity

		totalWithoutVAT += subtotalWithoutVat

		const vatMultiplier = item.vat <= 1 ? item.vat : item.vat / 100
		const vatAmount = subtotalWithoutVat * vatMultiplier
		totalWithVAT += subtotalWithoutVat + vatAmount
	}

	if (totalWithVAT > serviceConstraints.maximumOrderValueInMinorUnits) {
		maximumOrderValueExceeded = true
	}

	return { totalWithVAT, totalWithoutVAT, maximumOrderValueExceeded }
}
