'use client'
import type { SettingsDeliveryDaysPATCHbody, SettingsDeliveryDaysPATCHresponse } from '@/app/api/settings/delivery-days/patch'
import type { SettingsGETresponse } from '@/app/api/settings/get'
import type { SettingsHolidaysPOSTbody, SettingsHolidaysPOSTresponse } from '@/app/api/settings/holidays/post'
import type { SettingsPATCHbody, SettingsPATCHresponse } from '@/app/api/settings/patch'
import { useNotifications } from '@/components/providers/notifications'
import { useUser } from '@/components/providers/user'
import { apiRequest } from '@/library/utilities/public'
import type { BrowserSafeCompositeUser, Holiday, WeekDayIndex } from '@/types'
import { produce } from 'immer'
import { type Dispatch, type ReactNode, type SetStateAction, createContext, useContext, useEffect, useRef, useState } from 'react'

type Settings = {
	cutOff: Date | null
	leadTime: number | null
	minimumSpend: number | null
	holidays: Holiday[] | null
	acceptedDeliveryDays: WeekDayIndex[] | null
}

export type EditingState = {
	cutOff: boolean
	leadTime: boolean
	holidays: boolean
	acceptedDeliveryDays: boolean
	minimumSpend: boolean
}

type MerchantSettingsContextType = {
	isLoading: boolean
	// Retrieved settings
	holidays: Holiday[] | null
	acceptedDeliveryDays: WeekDayIndex[] | null

	// Editing state
	isEditing: EditingState
	setIsEditing: Dispatch<SetStateAction<EditingState>>

	newSettings: Settings
	setNewSettings: Dispatch<SetStateAction<Settings>>

	// API functions
	updateSetting: (body: SettingsPATCHbody, onSuccess: (user: BrowserSafeCompositeUser) => void) => Promise<boolean>
	saveCutOffTime: () => Promise<void>
	saveLeadTime: () => Promise<void>
	saveMinimumSpend: () => Promise<void>
	addHoliday: (startDate: Date, endDate: Date) => Promise<void>
	updateDeliveryDays: (dayIndexes: number[]) => Promise<boolean>
}

const MerchantSettingsContext = createContext<MerchantSettingsContextType | null>(null)

export function MerchantSettingsProvider({ children }: { children: ReactNode }) {
	const { user, setUser } = useUser()
	const { successNotification, errorNotification, serverErrorNotification } = useNotifications()
	const [isLoading, setIsLoading] = useState(true)

	const [isEditing, setIsEditing] = useState({
		cutOff: false,
		leadTime: false,
		acceptedDeliveryDays: false,
		holidays: false,
		minimumSpend: false,
	})

	// Settings that aren't already in the user object
	const [retrievedSettings, setRetrievedSettings] = useState<{
		holidays: Holiday[] | null
		acceptedDeliveryDays: WeekDayIndex[] | null
	}>({
		holidays: null,
		acceptedDeliveryDays: null,
	})

	const [newSettings, setNewSettings] = useState<{
		cutOff: Date | null
		leadTime: number | null
		minimumSpend: number | null
		holidays: Holiday[] | null
		acceptedDeliveryDays: WeekDayIndex[] | null
	}>({
		cutOff: user?.cutOffTime || null,
		leadTime: user?.leadTimeDays || null,
		minimumSpend: user?.minimumSpendPence || null,
		holidays: null,
		acceptedDeliveryDays: null,
	})

	const settingsFetched = useRef(false)

	// biome-ignore lint/correctness/useExhaustiveDependencies:
	useEffect(() => {
		async function fetchSettings() {
			try {
				setIsLoading(true)
				const { ok, holidays, acceptedWeekDayIndices, userMessage } = await apiRequest<SettingsGETresponse>({
					basePath: '/settings',
				})

				if (holidays) {
					setRetrievedSettings((prev) => ({ ...prev, holidays }))
				}

				if (acceptedWeekDayIndices) {
					setRetrievedSettings((prev) => ({ ...prev, acceptedWeekDayIndices }))
				}

				if (!ok && userMessage) {
					errorNotification(userMessage)
					return
				}
			} catch {
				serverErrorNotification()
			} finally {
				setIsLoading(false)
			}
		}

		if (!settingsFetched.current && user && user.roles !== 'customer') {
			fetchSettings()
			settingsFetched.current = true
		}
	}, [user])

	async function updateSetting(body: SettingsPATCHbody, onSuccess: (user: BrowserSafeCompositeUser) => void): Promise<boolean> {
		try {
			const { ok, userMessage } = await apiRequest<SettingsPATCHresponse, SettingsPATCHbody>({
				basePath: '/settings',
				method: 'PATCH',
				body,
			})

			if (ok) {
				setUser(
					produce((prevUser) => {
						if (!prevUser) return prevUser
						onSuccess(prevUser)
					}),
				)

				successNotification('Settings updated')
				return true
			}

			if (userMessage) errorNotification(userMessage)
			return false
		} catch {
			serverErrorNotification()
			return false
		}
	}

	async function saveCutOffTime() {
		const newCutOff = newSettings.cutOff
		if (!newCutOff) return

		const success = await updateSetting({ cutOffTime: newCutOff }, (user) => {
			user.cutOffTime = newCutOff
		})

		if (success) setIsEditing((prev) => ({ ...prev, cutOff: false }))
	}

	async function saveLeadTime() {
		const newLeadTime = newSettings.leadTime
		if (newLeadTime === null) return

		const success = await updateSetting({ leadTimeDays: newLeadTime }, (user) => {
			user.leadTimeDays = newLeadTime
		})

		if (success) setIsEditing((prev) => ({ ...prev, leadTime: false }))
	}

	async function saveMinimumSpend() {
		const newMinimumSpend = newSettings.minimumSpend
		if (newMinimumSpend === null) return

		const success = await updateSetting({ minimumSpendPence: newMinimumSpend }, (user) => {
			user.minimumSpendPence = newMinimumSpend
		})

		if (success) setIsEditing((prev) => ({ ...prev, minimumSpend: false }))
	}

	async function addHoliday(startDate: Date, endDate: Date) {
		try {
			const { ok, userMessage } = await apiRequest<SettingsHolidaysPOSTresponse, SettingsHolidaysPOSTbody>({
				basePath: '/settings/holidays',
				method: 'POST',
				body: { holidaysToAdd: [{ startDate, endDate }] },
			})

			if (ok) {
				setRetrievedSettings((prev) => ({
					...prev,
					holidays: [...(prev.holidays || []), ...(newSettings.holidays || [])],
				}))
				setIsEditing((prev) => ({ ...prev, holidays: false }))
				successNotification('Holiday added')
			}

			if (userMessage) errorNotification(userMessage)
		} catch {
			serverErrorNotification()
		}
	}

	async function updateDeliveryDays(dayIndexes: number[]) {
		try {
			const { ok, userMessage } = await apiRequest<SettingsDeliveryDaysPATCHresponse, SettingsDeliveryDaysPATCHbody>({
				basePath: '/settings/delivery-days',
				method: 'PATCH',
				body: { updatedWeekDayIndexes: dayIndexes },
			})

			if (ok) {
				setRetrievedSettings((prev) => ({ ...prev, acceptedDeliveryDays: newSettings.acceptedDeliveryDays }))
				setIsEditing((prev) => ({ ...prev, acceptedDeliveryDays: false }))
				successNotification('Delivery days updated')
				return true
			}

			if (userMessage) errorNotification(userMessage)
			return false
		} catch {
			serverErrorNotification()
			return false
		}
	}

	const value = {
		isLoading,
		holidays: retrievedSettings.holidays,
		acceptedDeliveryDays: retrievedSettings.acceptedDeliveryDays,
		isEditing,
		setIsEditing,
		newSettings,
		setNewSettings,
		updateSetting,
		saveCutOffTime,
		saveLeadTime,
		saveMinimumSpend,
		addHoliday,
		updateDeliveryDays,
	}

	return <MerchantSettingsContext.Provider value={value}>{children}</MerchantSettingsContext.Provider>
}

export function useMerchantSettings() {
	const context = useContext(MerchantSettingsContext)

	if (!context) {
		throw new Error('useMerchantSettings must be used within a MerchantSettingsProvider')
	}

	return context
}
