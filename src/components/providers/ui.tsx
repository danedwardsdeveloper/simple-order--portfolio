'use client'
import { defaultMerchantModeBoolean, localStorageItems } from '@/library/constants'
import type { CurrencyCode, Roles } from '@/types'
import type { UiContextType } from '@/types/definitions/contexts/ui'
import { type ReactNode, createContext, useContext, useEffect, useState } from 'react'

const UiContext = createContext<UiContextType | undefined>(undefined)

export function UiProvider({ children }: { children: ReactNode }) {
	const storedMerchantMode = localStorage.getItem(localStorageItems.merchantMode)
	const initialMerchantMode = storedMerchantMode === null ? defaultMerchantModeBoolean : storedMerchantMode === 'true'
	const [merchantMode, setMerchantMode] = useState(initialMerchantMode)

	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	const [demoMode, setDemoMode] = useState(false)

	const storedCurrency = localStorage.getItem(localStorageItems.currency) as CurrencyCode | null
	const [currency, setCurrency] = useState<CurrencyCode>(storedCurrency || 'GBP')

	// biome-ignore lint/correctness/useExhaustiveDependencies: <run on mount>
	useEffect(() => {
		if (storedMerchantMode === null) {
			localStorage.setItem(localStorageItems.merchantMode, initialMerchantMode.toString())
		}

		if (!storedCurrency) {
			localStorage.setItem(localStorageItems.currency, currency)
		}
	}, [])

	function storeCurrency(newCurrency: CurrencyCode | ((prev: CurrencyCode) => CurrencyCode)) {
		setCurrency((current) => {
			const resolvedCurrency = typeof newCurrency === 'function' ? newCurrency(current) : newCurrency
			localStorage.setItem(localStorageItems.currency, resolvedCurrency)
			return resolvedCurrency
		})
	}

	function toggleMerchantMode() {
		setMerchantMode((current) => {
			const newValue = !current
			localStorage.setItem(localStorageItems.merchantMode, newValue.toString())
			return newValue
		})
	}

	function setMerchantModeFromRoles(roles: Roles | undefined) {
		const mode =
			roles === 'merchant'
				? true
				: roles === 'customer'
					? false
					: localStorage.getItem(localStorageItems.merchantMode) === 'true' || defaultMerchantModeBoolean

		localStorage.setItem(localStorageItems.merchantMode, mode.toString())
		setMerchantMode(mode)
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
		setMerchantModeFromRoles,

		demoMode,
		setDemoMode,
		toggleDemoMode,

		includeVat,
		setIncludeVat,
		toggleIncludeVat,

		currency,
		storeCurrency,
	}

	return <UiContext.Provider value={value}>{children}</UiContext.Provider>
}

export function useUi() {
	const context = useContext(UiContext)
	if (context === undefined) throw new Error('useUi must be used within a UiProvider')
	return context
}
