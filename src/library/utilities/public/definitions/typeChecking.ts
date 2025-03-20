import { orderStatusArray, systemMessages, unauthorisedMessages, userMessages } from '@/library/constants'
import type { OrderStatus, SelectedProduct, SystemMessages, UnauthorisedMessages, UserMessages } from '@/types'

export function isSystemMessage(message: string): message is SystemMessages {
	return Object.values(systemMessages).includes(message as SystemMessages)
}

export function isUserMessage(message: string): message is UserMessages {
	return Object.values(userMessages).includes(message as UserMessages)
}

export function isUnauthorisedMessage(message: string): message is UnauthorisedMessages {
	return Object.values(unauthorisedMessages).includes(message as UnauthorisedMessages)
}

export function isOrderStatus(value: unknown): value is OrderStatus {
	if (typeof value !== 'string') return false
	return orderStatusArray.includes(value as OrderStatus)
}

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
