import type { Holiday, WeekDayIndex } from '@/types'
import { flattenHolidays } from '../flattenHolidays'
import { getLookAheadRange } from '../getLookAheadRange'
import { givesEnoughNotice } from '../givesEnoughNotice'

export type Props = {
	acceptedWeekDayIndices: WeekDayIndex[]
	holidays: Holiday[] | null
	lookAheadDays: number
	cutOffTime: Date
	leadTimeDays: number
}

export function getAvailableDeliveryDays(props: Props): Date[] | null {
	if (props.acceptedWeekDayIndices.length === 0) return null

	const { today, rangeEnd } = getLookAheadRange(props.lookAheadDays)

	const flatHolidays = flattenHolidays({ holidays: props.holidays, today, rangeEnd })

	const holidayStrings = flatHolidays ? flatHolidays.map((date) => date.toISOString().split('T')[0]) : []

	const acceptedDeliveryDays: Date[] = []
	const iterationDate = today

	while (iterationDate < rangeEnd) {
		// Convert JavaScript Sunday (0) to my system (7)
		const dayOfWeek = iterationDate.getDay() || 7

		const dateString = iterationDate.toISOString().split('T')[0]

		const enoughNotice = givesEnoughNotice({
			requestedDeliveryDate: iterationDate,
			cutOffTime: props.cutOffTime,
			leadTimeDays: props.leadTimeDays,
		})

		if (
			props.acceptedWeekDayIndices.includes(dayOfWeek as WeekDayIndex) && //
			!holidayStrings.includes(dateString) &&
			enoughNotice
		) {
			acceptedDeliveryDays.push(new Date(iterationDate))
		}

		iterationDate.setUTCDate(iterationDate.getUTCDate() + 1)
	}

	return acceptedDeliveryDays
}
