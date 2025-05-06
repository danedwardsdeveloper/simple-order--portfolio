import { database } from '@/library/database/connection'
import { holidays } from '@/library/database/schema'
import logger from '@/library/logger'
import { and, equals, greaterThanOrEqual, lessThanOrEqual } from '@/library/utilities/server'
import type { DangerousBaseUser, Holiday } from '@/types'

/**
 * Retrieves holidays when the merchant doesn't accept deliveries
 * @param merchantProfile The merchant user profile
 * @param lookAheadDays The number of days to look ahead for holidays
 * ADDS todays to today. So if today is the 1st, and lookahead is 14, then holidays on the 15th will be included
 * @returns An array of dates the merchant is on holiday
 */
export async function getHolidays({
	merchantProfile,
	lookAheadDays,
}: { merchantProfile: DangerousBaseUser; lookAheadDays: number }): Promise<Date[] | null> {
	try {
		const today = new Date()
		today.setUTCHours(0, 0, 0, 0)

		const futureDate = new Date()
		futureDate.setUTCHours(0, 0, 0, 0)

		futureDate.setDate(today.getDate() + lookAheadDays)

		const merchantHolidays: Holiday[] = await database
			.select({ startDate: holidays.startDate, endDate: holidays.endDate })
			.from(holidays)
			.where(
				and(
					equals(holidays.userId, merchantProfile.id),
					and(
						lessThanOrEqual(holidays.startDate, futureDate), //
						greaterThanOrEqual(holidays.endDate, today),
					),
				),
			)
			.orderBy(holidays.startDate)

		if (merchantHolidays.length === 0) {
			logger.info(`No holidays found for ${merchantProfile.businessName}`)
			return null
		}

		const allHolidayDates: Date[] = []

		for (const holiday of merchantHolidays) {
			const currentDate = new Date(holiday.startDate)
			const endDate = new Date(holiday.endDate)

			while (currentDate <= endDate) {
				if (currentDate >= today && currentDate <= futureDate) {
					allHolidayDates.push(new Date(currentDate))
				}
				currentDate.setDate(currentDate.getDate() + 1)
			}
		}

		return allHolidayDates
	} catch (error) {
		logger.error('getHolidays error', error)
		throw error
	}
}
