export function isValidDate(date: Date) {
	return date instanceof Date && !Number.isNaN(date.getTime())
}
