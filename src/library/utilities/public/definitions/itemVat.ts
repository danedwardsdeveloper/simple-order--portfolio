export function itemVAT(
	priceWithoutVat: number,
	vatRate: number,
): {
	itemVatOnly: number
	itemWithVat: number
} {
	const vatMultiplier = vatRate <= 1 ? vatRate : vatRate / 100
	const itemVatOnly = priceWithoutVat * vatMultiplier
	const itemWithVat = priceWithoutVat + itemVatOnly

	return { itemVatOnly, itemWithVat }
}
