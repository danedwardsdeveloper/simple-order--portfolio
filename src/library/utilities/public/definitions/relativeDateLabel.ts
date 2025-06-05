import { differenceInMinutes, isToday, isTomorrow, isYesterday } from 'date-fns'

export function relativeDateLabel(date: Date) {
	const now = new Date()
	const minutesDiff = differenceInMinutes(now, date)

	if (minutesDiff >= 0) {
		if (minutesDiff <= 10) return '(just now)'
		if (isToday(date)) return '(today)'
		if (isYesterday(date)) return '(yesterday)'
	}

	if (minutesDiff < 0) {
		if (isToday(date)) return '(today)'
		if (isTomorrow(date)) return '(tomorrow)'
	}

	return undefined
}
