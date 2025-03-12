'use client'
import { localStorageItems } from '@/library/constants/definitions/localStorage'
import { type Dispatch, type ReactNode, type SetStateAction, createContext, useContext, useEffect, useState } from 'react'

interface UiContextType {
	mobileMenuOpen: boolean
	setMobileMenuOpen: Dispatch<SetStateAction<boolean>>
	toggleMobileMenuOpen: () => void

	merchantMode: boolean
	setMerchantMode: Dispatch<SetStateAction<boolean>>
	toggleMerchantMode: () => void

	includeVat: boolean
	setIncludeVat: Dispatch<SetStateAction<boolean>>
	toggleIncludeVat: () => void
}

const UiContext = createContext<UiContextType | undefined>(undefined)

export function UiProvider({ children }: { children: ReactNode }) {
	// Default has to be merchant mode, or new free trials can't invite customers
	const storedMerchantMode = localStorage.getItem(localStorageItems.merchantMode)
	const initialMerchantMode = storedMerchantMode === null ? true : storedMerchantMode === 'true'
	const [merchantMode, setMerchantMode] = useState(initialMerchantMode)

	// biome-ignore lint/correctness/useExhaustiveDependencies:
	useEffect(() => {
		if (storedMerchantMode === null) {
			localStorage.setItem(localStorageItems.merchantMode, initialMerchantMode.toString())
		}
	}, [])

	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	function toggleMerchantMode() {
		setMerchantMode((current) => {
			const newValue = !current
			localStorage.setItem(localStorageItems.merchantMode, newValue.toString())
			return newValue
		})
	}

	function toggleMobileMenuOpen() {
		setMobileMenuOpen((current) => !current)
	}

	const [includeVat, setIncludeVat] = useState(false)
	const toggleIncludeVat = () => {
		setIncludeVat((current) => !current)
	}

	const value = {
		mobileMenuOpen,
		setMobileMenuOpen,
		toggleMobileMenuOpen,

		merchantMode,
		setMerchantMode,
		toggleMerchantMode,

		includeVat,
		setIncludeVat,
		toggleIncludeVat,
	}

	return <UiContext.Provider value={value}>{children}</UiContext.Provider>
}

export function useUi() {
	const context = useContext(UiContext)
	if (context === undefined) throw new Error('useUi must be used within a UiProvider')
	return context
}
