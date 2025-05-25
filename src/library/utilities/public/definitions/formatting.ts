import { format } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'

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
 * @example
 * 7 September
 */
export function formatDate(date: Date): string {
	return format(date, 'd MMMM')
}

/**
 * @example
 * 7 September 2025
 */
export function formatDateFull(date: Date): string {
	return format(date, 'd MMMM yyyy')
}

/**
 * @example
 * Wednesday, 7 September 2025
 */
export function formatDateWithDayName(date: Date): string {
	return format(date, 'EEEE, d MMMM yyyy')
}

export function capitaliseFirstLetter(str: string): string {
	if (!str) return str
	return str.charAt(0).toUpperCase() + str.slice(1)
}

export function formatPrice(pence: number): string {
	if (Number.isNaN(pence)) throw new Error('formatPrice: tried to format NaN')

	const roundedPence = Math.round(pence)
	const isNegative = roundedPence < 0
	const negativeSign = isNegative ? '-' : ''
	const absoluteRoundedPence = Math.abs(roundedPence)

	if (absoluteRoundedPence < 100) return `${negativeSign}${absoluteRoundedPence}p`

	const absolutePounds = absoluteRoundedPence / 100

	if (Number.isInteger(absolutePounds)) return `${negativeSign}£${absolutePounds.toLocaleString('en-GB')}`

	return `${negativeSign}£${absolutePounds.toLocaleString('en-GB', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}`
}

export function formatTime(time: Date | null) {
	if (!time) return ''
	return formatInTimeZone(time, 'UTC', 'h:mm a').toLowerCase()
}

/**
 * Adds an "s" to the end of a phrase based on the length of an array.
 * Handles null, undefined, and empty arrays.
 */
export function pluralise<T>(phrase: string, array: T[] | null | undefined): string {
	if (!array || array.length === 0) {
		return `${phrase}s`
	}

	return array.length === 1 ? phrase : `${phrase}s`
}
