export function getLookAheadRange(lookAheadDays: number) {
	const today = new Date()
	today.setUTCHours(0, 0, 0, 0)

	const rangeEnd = new Date()
	rangeEnd.setUTCHours(0, 0, 0, 0)

	rangeEnd.setDate(today.getDate() + lookAheadDays)
	return { today, rangeEnd }
}
