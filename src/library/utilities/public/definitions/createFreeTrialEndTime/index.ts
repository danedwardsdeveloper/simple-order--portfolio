import { addDays, setHours, setMinutes, setSeconds } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

/**
 * @returns a Date at least 30 days in the future, with the time set to 11.59pm (and 59 seconds) in UK time
 */
export function createFreeTrialEndTime(): Date {
	const nowUTC = new Date().setUTCHours(0, 0, 0, 0)
	const thirtyDays = addDays(nowUTC, 30)

	const ukTime = toZonedTime(thirtyDays, 'Europe/London')
	const endOfDay = setSeconds(setMinutes(setHours(ukTime, 23), 59), 59)

	if (endOfDay.getTime() - nowUTC < 30 * 24 * 60 * 60 * 1000) {
		return addDays(endOfDay, 1)
	}

	return endOfDay
}
