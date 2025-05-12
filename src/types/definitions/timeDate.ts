import type { HoursSchema, MinutesSchema } from '@/library/validations/definitions/time'
import type { z } from 'zod'

// Blog publication years
export type Year = 2025 | 2026 | 2027
export type Month = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11
export type Minutes = z.infer<typeof MinutesSchema>
export type Hours = z.infer<typeof HoursSchema>
export type WeekDayIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7
export type DayNumber =
	| 0
	| 1
	| 2
	| 3
	| 4
	| 5
	| 6
	| 7
	| 8
	| 9
	| 10
	| 11
	| 12
	| 13
	| 14
	| 15
	| 16
	| 17
	| 18
	| 19
	| 20
	| 21
	| 22
	| 23
	| 24
	| 25
	| 26
	| 27
	| 28
	| 29
	| 30
	| 31
