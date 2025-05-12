import { daysOfTheWeek } from '@/library/constants'
import type { WeekDayIndex } from '@/types'

export function weekDaysFromIndices(weekDayIndexes: WeekDayIndex[]) {
	return daysOfTheWeek.filter((day) => weekDayIndexes.includes(day.sortOrder as WeekDayIndex))
}
