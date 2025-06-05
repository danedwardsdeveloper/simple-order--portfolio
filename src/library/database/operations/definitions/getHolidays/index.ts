import { database } from '@/library/database/connection'
import { holidays } from '@/library/database/schema'
import { emptyToNull, getLookAheadRange } from '@/library/utilities/public'
import { and, equals, greaterThanOrEqual, lessThanOrEqual } from '@/library/utilities/server'
import type { Holiday, NonEmptyArray } from '@/types'

/**
 * Retrieves raw holidays entries from the database
 */
export async function getHolidays({
	userId,
	lookAheadDays,
}: { userId: number; lookAheadDays: number }): Promise<NonEmptyArray<Holiday> | null> {
	const { today, rangeEnd } = getLookAheadRange(lookAheadDays)

	const merchantHolidays: Holiday[] = await database
		.select({ startDate: holidays.startDate, endDate: holidays.endDate })
		.from(holidays)
		.where(
			and(
				equals(holidays.userId, userId),
				and(
					lessThanOrEqual(holidays.startDate, rangeEnd), //
					greaterThanOrEqual(holidays.endDate, today),
				),
			),
		)
		.orderBy(holidays.startDate)

	return emptyToNull(merchantHolidays)
}
