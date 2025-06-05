import type { DayNumber, Month, Year } from '@/types'
import { z } from 'zod'

// Avoid circular dependency
export const january: Month = 0

export function createDate(day: DayNumber, month: Month, year: Year): Date {
	return new Date(Date.UTC(year, month, day))
}

export const MinutesSchema = z.number().int().min(0).max(59)
export const HoursSchema = z.number().int().min(0).max(23)

type Hours = z.infer<typeof HoursSchema>
type Minutes = z.infer<typeof MinutesSchema>

export function createCutOffTime({ hours, minutes }: { hours: Hours; minutes: Minutes }): Date {
	HoursSchema.parse(hours)
	MinutesSchema.parse(minutes)

	const epochDay = new Date(Date.UTC(1970, january, 1))
	epochDay.setUTCHours(hours, minutes)
	return epochDay
}
