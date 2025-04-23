import type { SelectedProduct } from '@/types'

type Input = {
	merchantId: number
	customerId: number
	products: SelectedProduct[]
}

export async function createOrder({ merchantId, customerId, products }: Input) {
	// Much more complex than I thought!
	// Probably needs to move to server/utilities and use it in the actual application
	return
}
