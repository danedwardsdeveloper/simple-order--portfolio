import { serviceConstraints } from '@/library/constants'
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

// ToDo: use the Zod product schema to reject large numbers more elegantly
export function formatPrice(pence: number): string {
	if (pence > serviceConstraints.maximumProductValueInMinorUnits) {
		throw new Error('formatPrice: maximum price exceeded')
	}

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
