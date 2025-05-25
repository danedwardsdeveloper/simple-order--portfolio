// time is not part of the barrel as it will cause a treeshaking issue that breaks Drizzle studio
import { HoursSchema, MinutesSchema } from '@/library/validations/definitions/time'
import type { Hours, Minutes } from '@/types'
import { z } from 'zod'

export function epochDateToTimeInput(epochDate: Date) {
	const date = new Date(epochDate)
	const hours = date.getUTCHours().toString().padStart(2, '0')
	const minutes = date.getUTCMinutes().toString().padStart(2, '0')
	return `${hours}:${minutes}`
}

export function epochDateToAmPm(epochDate: Date): string {
	const date = new Date(epochDate)
	const hours = date.getUTCHours()
	const minutes = date.getUTCMinutes().toString().padStart(2, '0')
	const period = hours >= 12 ? 'pm' : 'am'
	const displayHours = hours % 12 || 12
	return `${displayHours}:${minutes}${period}`
}

const TimeInputSchema = z.string().regex(
	/^\d{1,2}:\d{2}$/, //
	"Time must be in format 'HH:MM'",
)

export function timeInputToEpochDate(timeInputValue: string): Date {
	TimeInputSchema.parse(timeInputValue)
	const [hours, minutes] = timeInputValue.split(':').map(Number)

	HoursSchema.parse(hours)
	MinutesSchema.parse(minutes)

	return createCutOffTime({ minutes, hours })
}

export function createCutOffTime({ hours, minutes }: { hours: Hours; minutes: Minutes }): Date {
	HoursSchema.parse(hours)
	MinutesSchema.parse(minutes)

	// Don't import january here or it causes a circular dependency!
	const epochDay = new Date(Date.UTC(1970, 0, 1))
	epochDay.setUTCHours(hours, minutes)
	return epochDay
}
