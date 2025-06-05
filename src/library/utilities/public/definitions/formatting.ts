import { monthlySubscriptionPriceInPence } from '@/library/constants/definitions/subscriptionPrice'
import { format } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { formatPrice } from './formatPrice'

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

// Used in programmatically generated articles. Should be currency specific
// This is a constant but it can cause circular dependency issues
/**
 * @deprecated
 */
export const formattedSubscriptionPrice = formatPrice(monthlySubscriptionPriceInPence, 'GBP')

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
