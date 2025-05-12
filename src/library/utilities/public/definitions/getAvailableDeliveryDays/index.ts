import type { DayOfTheWeek } from '@/types'
import { givesEnoughNotice } from '../givesEnoughNotice'

export type Props = {
	acceptedWeekDays: DayOfTheWeek[]
	merchantHolidays: Date[] | null
	lookAheadDays: number
	cutOffTime: Date
	leadTimeDays: number
}

// Update: I don't need the week days here, just the indices
export function getAvailableDeliveryDays({
	acceptedWeekDays,
	merchantHolidays,
	lookAheadDays,
	cutOffTime,
	leadTimeDays,
}: Props): Date[] | null {
	if (acceptedWeekDays.length === 0) return null

	const today = new Date()
	today.setUTCHours(0, 0, 0, 0)

	const futureDate = new Date()
	futureDate.setUTCDate(today.getUTCDate() + lookAheadDays)
	futureDate.setUTCHours(0, 0, 0, 0)

	const holidayStrings = merchantHolidays ? merchantHolidays.map((date) => date.toISOString().split('T')[0]) : []

	const acceptedWeekDaySortOrders = new Set(acceptedWeekDays.map((day) => day.sortOrder))

	const acceptedDeliveryDays: Date[] = []
	const iterationDate = new Date(today)

	while (iterationDate < futureDate) {
		// Convert JavaScript Sunday (0) to my system (7)
		const dayOfWeek = iterationDate.getDay() || 7

		const dateString = iterationDate.toISOString().split('T')[0]

		const enoughNotice = givesEnoughNotice({
			requestedDeliveryDate: iterationDate,
			cutOffTime,
			leadTimeDays,
		})

		if (
			acceptedWeekDaySortOrders.has(dayOfWeek) && //
			!holidayStrings.includes(dateString) &&
			enoughNotice
		) {
			acceptedDeliveryDays.push(new Date(iterationDate))
		}

		iterationDate.setUTCDate(iterationDate.getUTCDate() + 1)
	}

	return acceptedDeliveryDays
}
