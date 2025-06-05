import { emptyToNull } from '@/library/utilities/public'
import { inArray } from '@/library/utilities/server'
import type { BaseOrder, NonEmptyArray, OrderItem } from '@/types'
import { database } from '../../connection'
import { orderItems } from '../../schema'

export async function getOrderItems(orders: NonEmptyArray<BaseOrder> | null): Promise<NonEmptyArray<OrderItem> | null> {
	if (!orders) return null

	const orderIds = orders.map((order) => order.id)

	const foundOrderItems = await database.select().from(orderItems).where(inArray(orderItems.orderId, orderIds))

	return emptyToNull(foundOrderItems)
}
