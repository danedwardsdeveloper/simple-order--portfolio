import type { Holiday } from '../deliveryDays'
import type { WeekDayIndex } from '../timeDate'

export type SaveSetting<T1, T2 = void> = (value: T1, valueTwo?: T2) => Promise<boolean>

export type SettingsData = {
	holidays: Holiday[] | null
	acceptedWeekDayIndices: WeekDayIndex[] | null
}

export type SettingsContextSetters = {
	saveCutOffTime: SaveSetting<Date>
	saveLeadTime: SaveSetting<number>
	saveMinimumSpendPence: SaveSetting<number>
	addHoliday: SaveSetting<Date, Date>
	saveDeliveryDays: SaveSetting<number[]>
}

export type SettingsContextType = SettingsData & SettingsContextSetters

export type DemoSettingsContextType = {
	[K in keyof SettingsData]: NonNullable<SettingsData[K]>
} & SettingsContextSetters
