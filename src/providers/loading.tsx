'use client'
import logger from '@/library/logger'
import { type Dispatch, type ReactNode, type SetStateAction, createContext, useContext, useEffect, useState } from 'react'

interface LoadingContextType {
	siteLoading: boolean
	userDataLoading: boolean
	setUserDataLoading: Dispatch<SetStateAction<boolean>>
}

const initialLoadingContext: LoadingContextType = {
	siteLoading: true,
	userDataLoading: false,
	setUserDataLoading: () => {},
}

export const LoadingContext = createContext<LoadingContextType>(initialLoadingContext)

export function LoadingProvider({ children }: { children: ReactNode }) {
	const [siteLoading, setSiteLoading] = useState<boolean>(true)
	const [userDataLoading, setUserDataLoading] = useState<boolean>(false)

	useEffect(() => {
		const fontsPromise = document.fonts.ready
		const timeoutPromise = new Promise<void>((resolve) => setTimeout(() => resolve(), 800))

		Promise.all([fontsPromise, timeoutPromise])
			.then(() => setSiteLoading(false))
			.catch((error) => {
				logger.error('LoadingProvider error:', error)
				setSiteLoading(false)
			})
	}, [])

	const contextValue: LoadingContextType = {
		siteLoading,
		userDataLoading,
		setUserDataLoading,
	}

	return <LoadingContext.Provider value={contextValue}>{children}</LoadingContext.Provider>
}

export function useLoading(): LoadingContextType {
	const context = useContext(LoadingContext)

	if (context === undefined) {
		throw new Error('useLoading must be used within a LoadingProvider')
	}

	return context
}
