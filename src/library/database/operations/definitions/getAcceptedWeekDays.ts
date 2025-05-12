import { database } from '@/library/database/connection'
import { acceptedDeliveryDays } from '@/library/database/schema'
import logger from '@/library/logger'
import { weekDaysFromIndices } from '@/library/utilities/public'
import { equals } from '@/library/utilities/server'
import type { DayOfTheWeek, WeekDayIndex } from '@/types'

export async function getAcceptedWeekDays(merchantId: number): Promise<DayOfTheWeek[]> {
	const acceptedWeekIndices = await getAcceptedWeekDayIndices(merchantId)
	return weekDaysFromIndices(acceptedWeekIndices)
}

export async function getAcceptedWeekDayIndices(merchantId: number): Promise<WeekDayIndex[]> {
	try {
		const deliveryDays = await database.query.acceptedDeliveryDays.findMany({
			where: equals(acceptedDeliveryDays.userId, merchantId),
			with: { dayOfWeek: true },
			orderBy: (relations) => relations.dayOfWeekId,
		})

		const formattedDeliveryDays: WeekDayIndex[] = deliveryDays.map((day) => day.dayOfWeek.sortOrder as WeekDayIndex)
		return formattedDeliveryDays
	} catch (error) {
		logger.error('getAcceptedWeekDayIndices', error)
		throw error
	}
}
