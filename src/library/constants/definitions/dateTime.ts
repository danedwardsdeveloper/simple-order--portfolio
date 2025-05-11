import type { DayOfTheWeek, Month } from '@/types'

export const january: Month = 0
export const february: Month = 1
export const march: Month = 2
export const april: Month = 3
export const may: Month = 4
export const june: Month = 5
export const july: Month = 6
export const august: Month = 7
export const september: Month = 8
export const october: Month = 9
export const november: Month = 10
export const december: Month = 11

export type WeekDayIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7
export const weekDayIndices = [1, 2, 3, 4, 5, 6, 7] as const

export const monday: WeekDayIndex = 1
export const tuesday: WeekDayIndex = 2
export const wednesday: WeekDayIndex = 3
export const thursday: WeekDayIndex = 4
export const friday: WeekDayIndex = 5
export const saturday: WeekDayIndex = 6
export const sunday: WeekDayIndex = 7

export const daysOfTheWeek: DayOfTheWeek[] = [
	{
		name: 'Monday',
		sortOrder: 1,
	},
	{
		name: 'Tuesday',
		sortOrder: 2,
	},
	{
		name: 'Wednesday',
		sortOrder: 3,
	},
	{
		name: 'Thursday',
		sortOrder: 4,
	},
	{
		name: 'Friday',
		sortOrder: 5,
	},
	{
		name: 'Saturday',
		sortOrder: 6,
	},
	{
		name: 'Sunday',
		sortOrder: 7,
	},
]
