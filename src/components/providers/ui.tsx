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

	demoMode: boolean
	setDemoMode: Dispatch<SetStateAction<boolean>>
	toggleDemoMode: () => void

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
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const [demoMode, setDemoMode] = useState(false)

	// biome-ignore lint/correctness/useExhaustiveDependencies:
	useEffect(() => {
		if (storedMerchantMode === null) {
			localStorage.setItem(localStorageItems.merchantMode, initialMerchantMode.toString())
		}
	}, [])

	function toggleMerchantMode() {
		setMerchantMode((current) => {
			const newValue = !current
			localStorage.setItem(localStorageItems.merchantMode, newValue.toString())
			return newValue
		})
	}

	function toggleDemoMode() {
		setDemoMode((current) => !current)
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

		demoMode,
		setDemoMode,
		toggleDemoMode,

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
