import type { FormattedOrder, NonEmptyArray } from '@/types'

// Spaces are fine on most browsers

function formatSingle(order: FormattedOrder) {
	return `${order.idString} ${order.customerName}.pdf`
}

function formatBatch(_orders: NonEmptyArray<FormattedOrder>) {
	// ToDo!
	return ''
}

export function createFileName(orders: NonEmptyArray<FormattedOrder>) {
	if (orders.length === 1) {
		return formatSingle(orders[0])
	}
	return formatBatch(orders)
}
