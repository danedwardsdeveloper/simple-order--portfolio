import { format } from 'date-fns'

export function formatTimeAndDate(date: Date): string {
	const time = format(date, 'h:mm').toLowerCase()
	const meridiem = format(date, 'a').toLowerCase()

	return `${time} ${meridiem} on ${format(date, 'EEEE, d MMMM yyyy')}`
}

/**
 * Formats a date in the "4 March" or "7 September" format
 */
export function formatDate(date: Date): string {
	return format(date, 'd MMMM')
}

// console.log(formatTimeAndDate(new Date()))
// 3:25pm GMT on Monday, 10 February 2025

/* 
pnpm tsx src/library/utilities/definitions/formatDate
*/
