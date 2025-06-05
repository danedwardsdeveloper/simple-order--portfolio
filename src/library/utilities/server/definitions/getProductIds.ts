import type { NonEmptyArray, OrderItem } from '@/types'
import { emptyToNull } from '../../public'

export function getProductIds(orderItems: NonEmptyArray<OrderItem> | null): NonEmptyArray<number> | null {
	if (!orderItems) return null

	const productIds = [...new Set(orderItems.map((item) => item.productId))]
	return emptyToNull(productIds)
}
