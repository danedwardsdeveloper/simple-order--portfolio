import { emptyToNull } from '@/library/utilities/public'
import { and, equals, greaterThan, or } from '@/library/utilities/server'
import type { BaseOrder, NonEmptyArray, Roles, WhereCondition } from '@/types'
import { database } from '../../connection'
import { orders } from '../../schema'

type Props = {
	userId: number
	roles: Roles
	daysBack: number
}

export async function getOrderRows(props: Props): Promise<NonEmptyArray<BaseOrder> | null> {
	const { userId, roles, daysBack } = props

	const cutoffDate = new Date()
	cutoffDate.setDate(cutoffDate.getDate() - daysBack)

	let userCondition: WhereCondition

	if (roles === 'merchant') {
		userCondition = equals(orders.merchantId, userId)
	} else if (roles === 'customer') {
		userCondition = equals(orders.customerId, userId)
	} else {
		// 'both'
		userCondition = or(
			equals(orders.merchantId, userId), //
			equals(orders.customerId, userId),
		)
	}

	const whereCondition = and(
		userCondition, //
		greaterThan(orders.createdAt, cutoffDate),
	)

	const orderRecords = await database.select().from(orders).where(whereCondition)

	return emptyToNull(orderRecords)
}
