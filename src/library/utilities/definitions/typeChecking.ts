import { orderStatusValues, systemMessages, unauthorisedMessages, userMessages } from '@/library/constants'
import type { OrderStatus, SystemMessages, UnauthorisedMessages, UserMessages } from '@/types'

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
	return orderStatusValues.includes(value as OrderStatus)
}
