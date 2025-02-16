import { addDays, setHours, setMilliseconds, setMinutes, setSeconds } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

export function createFreeTrialEndTime(): Date {
	const now = new Date()
	const thirtyOneDays = addDays(now, 31)

	const ukTime = toZonedTime(thirtyOneDays, 'Europe/London')
	const endOfDay = setMilliseconds(setSeconds(setMinutes(setHours(ukTime, 23), 59), 59), 999)

	if (endOfDay.getTime() - now.getTime() < 31 * 24 * 60 * 60 * 1000) {
		return addDays(endOfDay, 1)
	}

	return endOfDay
}
