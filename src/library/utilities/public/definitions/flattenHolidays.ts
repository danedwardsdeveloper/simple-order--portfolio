import type { Holiday } from '@/types'

type Props = {
	holidays: Holiday[] | null
	today: Date
	rangeEnd: Date
}

/**
 * Takes an array of objects with startDate and endDate, and flattens them into an array of dates
 */
export function flattenHolidays(props: Props): Date[] {
	if (!props.holidays) return []

	const allHolidayDates: Date[] = []

	for (const holiday of props.holidays) {
		const currentDate = new Date(holiday.startDate)
		const endDate = new Date(holiday.endDate)

		while (currentDate <= endDate) {
			if (currentDate >= props.today && currentDate <= props.rangeEnd) {
				allHolidayDates.push(new Date(currentDate))
			}
			currentDate.setDate(currentDate.getDate() + 1)
		}
	}

	return allHolidayDates
}
