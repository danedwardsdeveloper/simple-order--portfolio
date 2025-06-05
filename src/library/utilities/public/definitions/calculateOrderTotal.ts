import { serviceConstraints } from '@/library/constants'
import type { BrowserOrderItem } from '@/types'
import { itemVAT } from './itemVat'

export function calculateOrderTotal(orderItems: BrowserOrderItem[]): {
	totalWithVAT: number
	totalWithoutVAT: number
	maximumOrderValueExceeded: boolean
	vatOnly: number
} {
	let totalWithoutVAT = 0
	let vatOnly = 0

	for (const item of orderItems) {
		const subtotalWithoutVat = item.priceInMinorUnitsWithoutVat * item.quantity
		totalWithoutVAT += subtotalWithoutVat

		const { itemVatOnly } = itemVAT(item.priceInMinorUnitsWithoutVat, item.vat)

		vatOnly += itemVatOnly * item.quantity
	}

	const totalWithVAT = totalWithoutVAT + vatOnly
	const maximumOrderValueExceeded = totalWithVAT > serviceConstraints.maximumOrderValueInMinorUnits

	return { totalWithVAT, totalWithoutVAT, maximumOrderValueExceeded, vatOnly }
}
