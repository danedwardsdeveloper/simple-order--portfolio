'use client'
import { type Dispatch, type ReactNode, type SetStateAction, createContext, useContext, useState } from 'react'

interface UiContextType {
	merchantMode: boolean
	setMerchantMode: (value: boolean) => void
	toggleMerchantMode: () => void
	includeVat: boolean
	setIncludeVat: (value: boolean) => void
	toggleIncludeVat: () => void

	breadCrumbTest: string | null
	setBreadCrumbTest: Dispatch<SetStateAction<string | null>>
}

const UiContext = createContext<UiContextType | undefined>(undefined)

// ToDo: store the merchantMode in local storage or it's very annoying

export function UiProvider({ children }: { children: ReactNode }) {
	// Default needs to be merchant mode, or new free trials can't invite customers
	const [merchantMode, setMerchantMode] = useState(true)
	const [breadCrumbTest, setBreadCrumbTest] = useState<string | null>('Not set!')

	const toggleMerchantMode = () => {
		setMerchantMode((current) => !current)
	}

	const [includeVat, setIncludeVat] = useState(false)
	const toggleIncludeVat = () => {
		setIncludeVat((current) => !current)
	}

	const value = {
		merchantMode,
		setMerchantMode,
		toggleMerchantMode,
		includeVat,
		setIncludeVat,
		toggleIncludeVat,

		breadCrumbTest,
		setBreadCrumbTest,
	}

	return <UiContext.Provider value={value}>{children}</UiContext.Provider>
}

export function useUi() {
	const context = useContext(UiContext)
	if (context === undefined) throw new Error('useUi must be used within a UiProvider')
	return context
}
