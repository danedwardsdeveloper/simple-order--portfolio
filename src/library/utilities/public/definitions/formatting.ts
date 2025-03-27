import { format } from 'date-fns'

/**
 * Example:
 * 3:45 pm, Monday, 13 March 2025
 */
export function formatTimeAndDate(date: Date): string {
	const time = format(date, 'h:mm').toLowerCase()
	const meridiem = format(date, 'a').toLowerCase()

	return `${time} ${meridiem}, ${format(date, 'EEEE, d MMMM yyyy')}`
}

/**
 * Example
 * 7 September
 */
export function formatDate(date: Date): string {
	return format(date, 'd MMMM')
}

export function capitaliseFirstLetter(str: string): string {
	if (!str) return str
	return str.charAt(0).toUpperCase() + str.slice(1)
}

export function formatPrice(pence: number): string {
	if (pence < 100) {
		return `${pence}p`
	}

	const pounds = pence / 100
	if (Number.isInteger(pounds)) {
		return `£${pounds}`
	}

// ToDo: add commas where needed

	return `£${pounds.toFixed(2)}`
}
