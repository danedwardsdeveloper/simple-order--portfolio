'use client'
import { useNotifications } from '@/components/providers/notifications'
import { userNotifications } from '@/library/constants'
import { subtleDelay } from '@/library/utilities/public'
import type { Holiday, WeekDayIndex } from '@/types'
import { type ReactNode, createContext, useContext, useState } from 'react'
import { useDemoUser } from './user'

type DemoSettingsContextType = {
	// Settings data
	holidays: Holiday[] | null
	acceptedWeekDayIndices: WeekDayIndex[] | null

	// Save functions
	saveCutOffTime: (value: Date) => Promise<void>
	saveLeadTime: (value: number) => Promise<void>
	saveMinimumSpendPence: (value: number) => Promise<void>
	addHoliday: (startDate: Date, endDate: Date) => Promise<void>
	updateDeliveryDays: (dayIndexes: number[]) => Promise<boolean>
}

const DemoSettingsContext = createContext<DemoSettingsContextType | null>(null)

const {
	settingsUpdated: { cutOffMessage, minimumSpendMessage, holidayAddedMessage, leadTimeDaysMessage, deliveryDaysMessage },
} = userNotifications

export function DemoSettingsProvider({ children }: { children: ReactNode }) {
	const { successNotification } = useNotifications()
	const { setDemoUser } = useDemoUser()

	// Settings that aren't already in the user object
	const [retrievedSettings, setRetrievedSettings] = useState<{
		holidays: Holiday[] | null
		acceptedWeekDayIndices: WeekDayIndex[] | null
	}>({
		holidays: null,
		acceptedWeekDayIndices: [1, 2, 3, 4, 5], // Initialize with some demo days
	})

	async function saveCutOffTime(value: Date): Promise<void> {
		await subtleDelay()

		setDemoUser((prev) => ({ ...prev, cutOffTime: value }))
		successNotification(cutOffMessage)
	}

	async function saveLeadTime(value: number): Promise<void> {
		await subtleDelay()

		setDemoUser((prev) => ({ ...prev, leadTimeDays: value }))
		successNotification(leadTimeDaysMessage)
	}

	async function saveMinimumSpendPence(value: number): Promise<void> {
		await subtleDelay()

		setDemoUser((prev) => ({ ...prev, minimumSpendPence: value }))
		successNotification(minimumSpendMessage)
	}

	async function addHoliday(startDate: Date, endDate: Date): Promise<void> {
		await subtleDelay()

		setRetrievedSettings((prev) => ({
			...prev,
			holidays: [...(prev.holidays || []), { startDate, endDate }],
		}))
		successNotification(holidayAddedMessage)
	}

	async function updateDeliveryDays(dayIndexes: number[]): Promise<boolean> {
		try {
			await subtleDelay()

			setRetrievedSettings((prev) => ({
				...prev,
				acceptedWeekDayIndices: dayIndexes as WeekDayIndex[],
			}))

			successNotification(deliveryDaysMessage)
			return true
		} catch {
			return false
		}
	}

	const value = {
		holidays: retrievedSettings.holidays,
		acceptedWeekDayIndices: retrievedSettings.acceptedWeekDayIndices,
		saveCutOffTime,
		saveLeadTime,
		saveMinimumSpendPence,
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
