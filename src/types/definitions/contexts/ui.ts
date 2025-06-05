import type { Dispatch, SetStateAction } from 'react'
import type { CurrencyCode } from '../currency'
import type { Roles } from '../roles'

export type UiContextData = {
	mobileMenuOpen: boolean
	merchantMode: boolean
	demoMode: boolean
	includeVat: boolean
	currency: CurrencyCode
}

export type UiContextActions = {
	setMobileMenuOpen: Dispatch<SetStateAction<boolean>>
	toggleMobileMenuOpen: () => void

	setMerchantMode: Dispatch<SetStateAction<boolean>>
	toggleMerchantMode: () => void
	setMerchantModeFromRoles: (roles: Roles | undefined) => void

	setDemoMode: Dispatch<SetStateAction<boolean>>
	toggleDemoMode: () => void

	setIncludeVat: Dispatch<SetStateAction<boolean>>
	toggleIncludeVat: () => void

	storeCurrency: (newCurrency: CurrencyCode | ((prev: CurrencyCode) => CurrencyCode)) => void
}

export type UiContextType = UiContextData & UiContextActions
