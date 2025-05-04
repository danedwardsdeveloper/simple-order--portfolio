import type { SelectedProduct } from '@/types'

export function isSelectedProductArray(input: Array<SelectedProduct>): input is SelectedProduct[] {
	if (!Array.isArray(input) || input.length === 0) return false

	return input.every((item) => {
		if (!item || typeof item !== 'object') {
			return false
		}

		return (
			'productId' in item &&
			typeof item.productId === 'number' &&
			Number.isInteger(item.productId) &&
			item.productId > 0 &&
			'quantity' in item &&
			typeof item.quantity === 'number' &&
			Number.isInteger(item.quantity) &&
			item.quantity > 0
		)
	})
}
