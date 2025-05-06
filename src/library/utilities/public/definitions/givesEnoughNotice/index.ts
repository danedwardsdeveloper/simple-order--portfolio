import { isBefore, startOfDay, subDays } from 'date-fns'

export function givesEnoughNotice({
	requestedDeliveryDate,
	cutOffTime,
	leadTimeDays,
}: { requestedDeliveryDate: Date; cutOffTime: Date; leadTimeDays: number }): boolean {
	const now = new Date()

	// Requested delivery date is more than one day in the past
	if (isBefore(startOfDay(requestedDeliveryDate), startOfDay(now))) return false

	const cutoffDate = subDays(requestedDeliveryDate, leadTimeDays)

	const timeString = cutOffTime.toISOString()
	const cutoffHour = Number.parseInt(timeString.substring(11, 13), 10)
	const cutoffMinute = Number.parseInt(timeString.substring(14, 16), 10)

	// Simple direct assignment
	const actualHour = cutoffHour
	const actualMinute = cutoffMinute

	const cutoffDateTime = new Date(cutoffDate.getFullYear(), cutoffDate.getMonth(), cutoffDate.getDate(), actualHour, actualMinute, 0, 0)

	const result = now <= cutoffDateTime

	const debug = false
	if (debug) {
		// biome-ignore lint/suspicious/noConsole: <testing>
		console.log(result ? 'Accepted' : 'Rejected', '\n', 'Mocked time: ', now, '\n', 'cutoffDateTime: ', cutoffDateTime)
	}

	return result
}
