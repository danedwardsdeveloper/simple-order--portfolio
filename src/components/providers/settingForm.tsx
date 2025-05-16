'use client'
import { type ReactNode, createContext, useContext, useEffect, useState } from 'react'

export type SettingFormConfig<T> = {
	initialValue: T
	onSave: (value: T) => Promise<void>
	isEqual?: (a: T, b: T) => boolean
}

export function useSettingForm<T>({
	initialValue,
	onSave,
	isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b),
}: SettingFormConfig<T>) {
	const [isEditing, setIsEditing] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [draftValue, setDraftValue] = useState<T>(initialValue)

	useEffect(() => {
		if (!isEditing) {
			setDraftValue(initialValue)
		}
	}, [isEditing, initialValue])

	const hasChanges = !isEqual(draftValue, initialValue)

	const startEditing = () => setIsEditing(true)
	const cancelEditing = () => setIsEditing(false)

	const handleSave = async () => {
		if (!hasChanges) return

		setIsSubmitting(true)
		try {
			await onSave(draftValue)
			setIsEditing(false)
		} finally {
			setIsSubmitting(false)
		}
	}

	return {
		isEditing,
		isSubmitting,
		draftValue,
		setDraftValue,
		hasChanges,
		startEditing,
		cancelEditing,
		handleSave,
	}
}

type SettingContextType = {
	title: string
	isEditing: boolean
	isSubmitting: boolean
	hasChanges: boolean
	startEditing: () => void
	cancelEditing: () => void
	handleSave: () => void
}

const SettingContext = createContext<SettingContextType | null>(null)

export function useSetting() {
	const context = useContext(SettingContext)
	if (!context) {
		throw new Error('useSetting must be used within a SettingProvider')
	}
	return context
}

type SettingProviderProps = {
	children: ReactNode
	value: SettingContextType
}

/**
 * This is used in <Setting /> only, so each setting has its own simplified logic to handle both the demo and actual application. It is NOT used in the main provider/index
 */
export function SettingProvider({ children, value }: SettingProviderProps) {
	return <SettingContext.Provider value={value}>{children}</SettingContext.Provider>
}
