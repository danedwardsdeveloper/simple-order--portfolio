'use client'
import { useNotifications } from '@/components/providers/notifications'
import { userNotifications } from '@/library/constants'
import { subtleDelay } from '@/library/utilities/public'
import type { Holiday, SettingsContextType, WeekDayIndex } from '@/types'
import { type ReactNode, createContext, useContext, useState } from 'react'
import { useDemoUser } from './user'

const DemoSettingsContext = createContext<SettingsContextType | null>(null)

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

	async function saveCutOffTime(value: Date): Promise<boolean> {
		await subtleDelay()

		setDemoUser((prev) => ({ ...prev, cutOffTime: value }))
		successNotification(cutOffMessage)
		return true
	}

	async function saveLeadTime(value: number): Promise<boolean> {
		await subtleDelay()

		setDemoUser((prev) => ({ ...prev, leadTimeDays: value }))
		successNotification(leadTimeDaysMessage)
		return true
	}

	async function saveMinimumSpendPence(value: number): Promise<boolean> {
		await subtleDelay()

		setDemoUser((prev) => ({ ...prev, minimumSpendPence: value }))
		successNotification(minimumSpendMessage)
		return true
	}

	async function addHoliday(startDate: Date, endDate?: Date): Promise<boolean> {
		await subtleDelay()

		setRetrievedSettings((prev) => ({
			...prev,
			holidays: [...(prev.holidays || []), { startDate, endDate: endDate ? endDate : startDate }],
		}))
		successNotification(holidayAddedMessage)
		return true
	}

	async function saveDeliveryDays(dayIndexes: number[]): Promise<boolean> {
		await subtleDelay()

		setRetrievedSettings((prev) => ({
			...prev,
			acceptedWeekDayIndices: dayIndexes as WeekDayIndex[],
		}))

		successNotification(deliveryDaysMessage)
		return true
	}

	const value = {
		holidays: retrievedSettings.holidays,
		acceptedWeekDayIndices: retrievedSettings.acceptedWeekDayIndices,
		saveCutOffTime,
		saveLeadTime,
		saveMinimumSpendPence,
		addHoliday,
		saveDeliveryDays,
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
