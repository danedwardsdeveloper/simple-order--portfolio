import { database } from '@/library/database/connection'
import { holidays } from '@/library/database/schema'
import logger from '@/library/logger'

export async function createHoliday(userId: number, startDate: Date, endDate?: Date) {
	// ToDo: handle UTC time??
	const resolvedEndDate = endDate ? endDate : startDate
	try {
		await database.insert(holidays).values({ startDate, endDate: resolvedEndDate, userId })
	} catch (error) {
		logger.error('createHoliday: failed to create holiday', error)
		throw error
	}
}
