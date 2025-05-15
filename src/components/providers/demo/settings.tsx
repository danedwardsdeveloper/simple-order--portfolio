'use client'
import { useNotifications } from '@/components/providers/notifications'
import { type Settings, type SettingsBooleans, initialSettingsBooleans } from '@/components/providers/settings'
import { defaultMinimumSpendPence, friday, monday, thursday, tuesday, userNotifications, wednesday } from '@/library/constants'
import { createCutOffTime, subtleDelay } from '@/library/utilities/public'
import type { BrowserSafeCompositeUser, Holiday, WeekDayIndex } from '@/types'
import { type Dispatch, type ReactNode, type SetStateAction, createContext, useContext, useState } from 'react'
import { useDemoUser } from './user'

type DemoSettingsContextType = {
	holidays: Holiday[] | null
	acceptedWeekDayIndices: WeekDayIndex[] | null

	isEditing: SettingsBooleans
	setIsEditing: Dispatch<SetStateAction<SettingsBooleans>>

	isSubmitting: SettingsBooleans
	setIsSubmitting: Dispatch<SetStateAction<SettingsBooleans>>

	newSettings: Settings
	setNewSettings: Dispatch<SetStateAction<Settings>>

	// Everything must be async to match the real components
	saveCutOffTime: () => Promise<void>
	saveLeadTime: () => Promise<void>
	saveMinimumSpend: (value: number) => Promise<void>
	addHoliday: (_startDate: Date, _endDate: Date) => Promise<void>
	updateDeliveryDays: (dayIndexes: number[]) => Promise<boolean>
}

const DemoSettingsContext = createContext<DemoSettingsContextType | null>(null)

const demoUser: BrowserSafeCompositeUser = {
	roles: 'merchant',
	cutOffTime: createCutOffTime({ hours: 18, minutes: 0 }),
	leadTimeDays: 1,
	minimumSpendPence: defaultMinimumSpendPence,
	firstName: 'Jane',
	lastName: 'Boodles',
	email: 'jane@janesbaker.com',
	businessName: "Jane's Bakery",
	slug: 'janes-bakery',
	emailConfirmed: true,
}

const {
	settingsUpdated: { cutOffMessage, minimumSpendMessage, holidayAddedMessage, leadTimeDaysMessage, deliveryDaysMessage },
} = userNotifications

export function DemoSettingsProvider({ children }: { children: ReactNode }) {
	const { successNotification } = useNotifications()
	const { setDemoUser } = useDemoUser()

	const [isEditing, setIsEditing] = useState(initialSettingsBooleans)
	const [isSubmitting, setIsSubmitting] = useState(initialSettingsBooleans)

	// Settings that aren't already in the user object
	const [retrievedSettings, setRetrievedSettings] = useState<{
		holidays: Holiday[] | null
		acceptedWeekDayIndices: WeekDayIndex[] | null
	}>({
		holidays: null,
		acceptedWeekDayIndices: [1, 2, 3, 4, 5], // Initialize with some demo days
	})

	const [newSettings, setNewSettings] = useState<Settings>({
		cutOff: demoUser.cutOffTime,
		leadTime: demoUser.leadTimeDays,
		minimumSpend: demoUser.minimumSpendPence,
		holidays: null,
		acceptedWeekDayIndices: [monday, tuesday, wednesday, thursday, friday],
	})

	async function saveCutOffTime(): Promise<void> {
		setIsSubmitting((prev) => ({ ...prev, cutOff: true }))

		await subtleDelay()

		setIsEditing((prev) => ({ ...prev, cutOff: false }))
		setIsSubmitting((prev) => ({ ...prev, cutOff: false }))
		successNotification(cutOffMessage)
	}

	async function saveLeadTime(): Promise<void> {
		setIsSubmitting((prev) => ({ ...prev, leadTime: true }))

		await subtleDelay()

		setIsEditing((prev) => ({ ...prev, leadTime: false }))
		setIsSubmitting((prev) => ({ ...prev, leadTime: false }))
		successNotification(leadTimeDaysMessage)
	}

	async function saveMinimumSpend(value: number): Promise<void> {
		setIsSubmitting((prev) => ({ ...prev, minimumSpend: true }))

		await subtleDelay()

		setDemoUser((prev) => ({ ...prev, minimumSpendPence: value }))

		setIsEditing((prev) => ({ ...prev, minimumSpend: false }))
		setIsSubmitting((prev) => ({ ...prev, minimumSpend: false }))
		successNotification(minimumSpendMessage)
	}

	async function addHoliday(_startDate: Date, _endDate: Date): Promise<void> {
		setIsSubmitting((prev) => ({ ...prev, holidays: true }))

		await subtleDelay()

		setIsEditing((prev) => ({ ...prev, holidays: false }))
		setIsSubmitting((prev) => ({ ...prev, holidays: false }))
		successNotification(holidayAddedMessage)
	}

	async function updateDeliveryDays(dayIndexes: number[]): Promise<boolean> {
		setIsSubmitting((prev) => ({ ...prev, acceptedDeliveryDays: true }))

		try {
			await subtleDelay()

			setRetrievedSettings((prev) => ({
				...prev,
				acceptedWeekDayIndices: dayIndexes as WeekDayIndex[],
			}))
			setIsEditing((prev) => ({ ...prev, acceptedDeliveryDays: false }))
			successNotification(deliveryDaysMessage)
		} finally {
			setIsSubmitting((prev) => ({ ...prev, acceptedDeliveryDays: false }))
		}

		return true
	}

	const value = {
		holidays: retrievedSettings.holidays,
		acceptedWeekDayIndices: retrievedSettings.acceptedWeekDayIndices,

		isEditing,
		setIsEditing,

		newSettings,
		setNewSettings,

		isSubmitting,
		setIsSubmitting,

		saveCutOffTime,
		saveLeadTime,
		saveMinimumSpend,
		addHoliday,
		updateDeliveryDays,
	}

	return <DemoSettingsContext.Provider value={value}>{children}</DemoSettingsContext.Provider>
}

export function useDemoSettings() {
	const context = useContext(DemoSettingsContext)

	if (!context) {
		throw new Error('useDemoSettings must be used within a DemoSettingsProvider')
	}

	return context
}
