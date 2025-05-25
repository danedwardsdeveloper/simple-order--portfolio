import { database } from '@/library/database/connection'
import { holidays } from '@/library/database/schema'
import logger from '@/library/logger'
import { getLookAheadRange } from '@/library/utilities/public'
import { and, equals, greaterThanOrEqual, lessThanOrEqual } from '@/library/utilities/server'
import type { DangerousBaseUser, Holiday } from '@/types'

/**
 * Retrieves holidays entries from the database
 */
export async function getHolidays({
	merchantProfile,
	lookAheadDays,
}: { merchantProfile: DangerousBaseUser; lookAheadDays: number }): Promise<Holiday[] | null> {
	try {
		const { today, rangeEnd } = getLookAheadRange(lookAheadDays)

		const merchantHolidays: Holiday[] = await database
			.select({ startDate: holidays.startDate, endDate: holidays.endDate })
			.from(holidays)
			.where(
				and(
					equals(holidays.userId, merchantProfile.id),
					and(
						lessThanOrEqual(holidays.startDate, rangeEnd), //
						greaterThanOrEqual(holidays.endDate, today),
					),
				),
			)
			.orderBy(holidays.startDate)

		if (merchantHolidays.length === 0) {
			logger.info(`No holidays found for ${merchantProfile.businessName}`)
			return null
		}

		return merchantHolidays
	} catch (error) {
		logger.error('getHolidays error', error)
		throw error
	}
}
