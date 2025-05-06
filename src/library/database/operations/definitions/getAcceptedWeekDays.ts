import { database } from '@/library/database/connection'
import { acceptedDeliveryDays } from '@/library/database/schema'
import logger from '@/library/logger'
import { equals } from '@/library/utilities/server'
import type { DayOfTheWeek } from '@/types'

type Output = Promise<DayOfTheWeek[]>

/**
 * @returns An array of week days that the merchant normally accepts deliveries on
 * [
 *   {
 *     name: 'monday',
 *     sortOrder: 1
 *   }
 * ]
 * @example const acceptedWeekDays = await getAcceptedWeekDays(dangerousMerchantProfile.id)
 */
export async function getAcceptedWeekDays(merchantId: number): Output {
	try {
		const deliveryDays = await database.query.acceptedDeliveryDays.findMany({
			where: equals(acceptedDeliveryDays.userId, merchantId),
			with: { dayOfWeek: true },
			orderBy: (relations) => relations.dayOfWeekId,
		})

		const formattedDeliveryDays: DayOfTheWeek[] = deliveryDays.map((day) => ({
			name: day.dayOfWeek.name,
			sortOrder: day.dayOfWeek.sortOrder,
		}))
		return formattedDeliveryDays
	} catch (error) {
		logger.error('getAcceptedWeekDays', error)
		throw error
	}
}
