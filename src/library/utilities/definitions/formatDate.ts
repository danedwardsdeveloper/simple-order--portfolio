import { format } from 'date-fns'
import { getTimezoneOffset } from 'date-fns-tz'

export function formatTimeAndDate(date: Date): string {
	const offset = getTimezoneOffset('Europe/London', date)
	const timezone = offset === 60 ? 'BST' : 'GMT'
	const time = format(date, 'h:mm').toLowerCase()
	const meridiem = format(date, 'a').toLowerCase()

	return `${time}${meridiem} ${timezone} on ${format(date, 'EEEE, d MMMM yyyy')}`
}

// console.log(formatTimeAndDate(new Date()))
// 3:25pm GMT on Monday, 10 February 2025

/* 
pnpm tsx src/library/utilities/definitions/formatDate
*/
