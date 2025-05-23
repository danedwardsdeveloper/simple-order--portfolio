import type { Holiday } from '../deliveryDays'
import type { WeekDayIndex } from '../timeDate'

export type SaveSetting<T1, T2 = void> = (value: T1, valueTwo?: T2) => Promise<boolean>

export type SettingsContextType = {
	// Settings data that isn't on the user object and has to be retrieved separately
	holidays: Holiday[] | null
	acceptedWeekDayIndices: WeekDayIndex[] | null

	// Data saving functions
	saveCutOffTime: SaveSetting<Date>
	saveLeadTime: SaveSetting<number>
	saveMinimumSpendPence: SaveSetting<number>
	addHoliday: SaveSetting<Date, Date>
	saveDeliveryDays: SaveSetting<number[]>
}
