'use client'
import type { SettingsDeliveryDaysPATCHbody, SettingsDeliveryDaysPATCHresponse } from '@/app/api/settings/delivery-days/patch'
import type { SettingsGETresponse } from '@/app/api/settings/get'
import type { SettingsHolidaysPOSTbody, SettingsHolidaysPOSTresponse } from '@/app/api/settings/holidays/post'
import type { SettingsPATCHbody, SettingsPATCHresponse } from '@/app/api/settings/patch'
import { useNotifications } from '@/components/providers/notifications'
import { useUser } from '@/components/providers/user'
import { defaultMinimumSpendPence } from '@/library/constants'
import { apiRequest } from '@/library/utilities/public'
import type { BrowserSafeCompositeUser, Holiday, WeekDayIndex } from '@/types'
import { produce } from 'immer'
import { type Dispatch, type ReactNode, type SetStateAction, createContext, useContext, useEffect, useRef, useState } from 'react'

export type Settings = {
	cutOff: Date | null
	leadTime: number | null
	minimumSpend: number | null
	holidays: Holiday[] | null
	acceptedWeekDayIndices: WeekDayIndex[] | null
}

export type SettingsBooleans = {
	cutOff: boolean
	leadTime: boolean
	holidays: boolean
	acceptedDeliveryDays: boolean
	minimumSpend: boolean
}

export const initialSettingsBooleans = {
	cutOff: false,
	leadTime: false,
	holidays: false,
	acceptedDeliveryDays: false,
	minimumSpend: false,
}

type MerchantSettingsContextType = {
	isLoading: boolean

	holidays: Holiday[] | null
	acceptedWeekDayIndices: WeekDayIndex[] | null

	isEditing: SettingsBooleans
	setIsEditing: Dispatch<SetStateAction<SettingsBooleans>>

	isSubmitting: SettingsBooleans
	setIsSubmitting: Dispatch<SetStateAction<SettingsBooleans>>

	newSettings: Settings
	setNewSettings: Dispatch<SetStateAction<Settings>>

	updateSetting: (body: SettingsPATCHbody, onSuccess: (user: BrowserSafeCompositeUser) => void) => Promise<boolean>
	saveCutOffTime: () => Promise<void>
	saveLeadTime: () => Promise<void>
	saveMinimumSpendPence: (value: number) => Promise<void>
	addHoliday: (startDate: Date, endDate: Date) => Promise<void>
	updateDeliveryDays: (dayIndexes: number[]) => Promise<boolean>
}

const MerchantSettingsContext = createContext<MerchantSettingsContextType | null>(null)

export function MerchantSettingsProvider({ children }: { children: ReactNode }) {
	const { user, setUser } = useUser()
	const { successNotification, errorNotification, serverErrorNotification } = useNotifications()
	const [isLoading, setIsLoading] = useState(true)

	const [isEditing, setIsEditing] = useState(initialSettingsBooleans)
	const [isSubmitting, setIsSubmitting] = useState(initialSettingsBooleans)

	// Settings that aren't already in the user object
	const [retrievedSettings, setRetrievedSettings] = useState<{
		holidays: Holiday[] | null
		acceptedWeekDayIndices: WeekDayIndex[] | null
	}>({
		holidays: null,
		acceptedWeekDayIndices: null,
	})

	/**
	 * @deprecated use local states instead
	 */
	const [newSettings, setNewSettings] = useState<Settings>({
		cutOff: user?.cutOffTime || null,
		leadTime: user?.leadTimeDays || null,
		minimumSpend: user?.minimumSpendPence || defaultMinimumSpendPence,
		holidays: null,
		acceptedWeekDayIndices: null,
	})

	const settingsFetched = useRef(false)

	// biome-ignore lint/correctness/useExhaustiveDependencies:
	useEffect(() => {
		// Global loading state
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
		setIsSubmitting((prev) => ({ ...prev, cutOff: true }))

		try {
			const newCutOff = newSettings.cutOff
			if (!newCutOff) return

			const success = await updateSetting({ cutOffTime: newCutOff }, (user) => {
				user.cutOffTime = newCutOff
			})

			if (success) {
				setIsEditing((prev) => ({ ...prev, cutOff: false }))
			}
		} catch {
			// handle error
		} finally {
			setIsSubmitting((prev) => ({ ...prev, cutOff: false }))
		}
	}

	async function saveLeadTime() {
		setIsSubmitting((prev) => ({ ...prev, leadTime: true }))

		try {
			const newLeadTime = newSettings.leadTime
			if (newLeadTime === null) return

			const success = await updateSetting({ leadTimeDays: newLeadTime }, (user) => {
				user.leadTimeDays = newLeadTime
			})

			if (success) setIsEditing((prev) => ({ ...prev, leadTime: false }))
		} catch {
			// handle error
		} finally {
			setIsSubmitting((prev) => ({ ...prev, leadTime: false }))
		}
	}

	async function saveMinimumSpendPence(value: number) {
		setIsSubmitting((prev) => ({ ...prev, minimumSpend: true }))

		try {
			const success = await updateSetting({ minimumSpendPence: value }, (user) => {
				user.minimumSpendPence = value
			})

			if (success) setIsEditing((prev) => ({ ...prev, minimumSpend: false }))
		} catch {
			// handle error
		} finally {
			setIsSubmitting((prev) => ({ ...prev, minimumSpend: false }))
		}
	}

	async function addHoliday(startDate: Date, endDate: Date) {
		setIsSubmitting((prev) => ({ ...prev, holidays: true }))

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
		} finally {
			setIsSubmitting((prev) => ({ ...prev, holidays: false }))
		}
	}

	async function updateDeliveryDays(dayIndexes: number[]) {
		setIsSubmitting((prev) => ({ ...prev, acceptedDeliveryDays: true }))

		try {
			const { ok, userMessage } = await apiRequest<SettingsDeliveryDaysPATCHresponse, SettingsDeliveryDaysPATCHbody>({
				basePath: '/settings/delivery-days',
				method: 'PATCH',
				body: { updatedWeekDayIndexes: dayIndexes },
			})

			if (ok) {
				setRetrievedSettings((prev) => ({ ...prev, acceptedWeekDayIndices: dayIndexes as WeekDayIndex[] }))
				setIsEditing((prev) => ({ ...prev, acceptedDeliveryDays: false }))
				successNotification('Delivery days updated')
				return true
			}

			if (userMessage) errorNotification(userMessage)
			return false
		} catch {
			serverErrorNotification()
			return false
		} finally {
			setIsSubmitting((prev) => ({ ...prev, acceptedDeliveryDays: false }))
		}
	}

	const value = {
		isLoading,

		holidays: retrievedSettings.holidays,
		acceptedWeekDayIndices: retrievedSettings.acceptedWeekDayIndices,

		isEditing,
		setIsEditing,

		newSettings,
		setNewSettings,

		isSubmitting,
		setIsSubmitting,

		updateSetting,
		saveCutOffTime,
		saveLeadTime,
		saveMinimumSpendPence,
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
