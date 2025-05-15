'use client'
import logger from '@/library/logger'
import { type Dispatch, type ReactNode, type SetStateAction, createContext, useContext, useEffect, useState } from 'react'

interface LoadingContextType {
	siteLoading: boolean

	dataLoading: boolean
	setDataLoading: Dispatch<SetStateAction<boolean>>

	siteSplashExists: boolean
	showSiteSplash: boolean

	contentSplashExists: boolean
	showContentSplash: boolean
}

const initialLoadingContext: LoadingContextType = {
	siteLoading: true,

	dataLoading: false,
	setDataLoading: () => {},

	siteSplashExists: true,
	showSiteSplash: true,

	contentSplashExists: false,
	showContentSplash: false,
}

export const LoadingContext = createContext<LoadingContextType>(initialLoadingContext)

export function LoadingProvider({ children }: { children: ReactNode }) {
	const [siteLoading, setSiteLoading] = useState<boolean>(true)
	const [dataLoading, setDataLoading] = useState<boolean>(false)
	const [siteSplashExists, setSplashExists] = useState(true)
	const [contentSplashExists, setContentSplashExists] = useState(false)

	const forceSiteSplash = false
	const forceContentSplash = false

	const showSiteSplash = forceSiteSplash || siteLoading
	const showContentSplash = forceContentSplash || dataLoading

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

	const fadeOutMilliseconds = 550

	useEffect(() => {
		if (showSiteSplash) {
			document.body.style.overflow = 'hidden'
			setSplashExists(true)
		} else {
			document.body.style.overflow = ''
			const timer = setTimeout(() => {
				setSplashExists(false)
			}, fadeOutMilliseconds)
			return () => clearTimeout(timer)
		}
	}, [showSiteSplash])

	useEffect(() => {
		if (showContentSplash) {
			setContentSplashExists(true)
		} else {
			const timer = setTimeout(() => {
				setContentSplashExists(false)
			}, fadeOutMilliseconds)
			return () => clearTimeout(timer)
		}
	}, [showContentSplash])

	const contextValue: LoadingContextType = {
		siteLoading,

		dataLoading,
		setDataLoading,

		siteSplashExists,
		showSiteSplash,

		contentSplashExists,
		showContentSplash,
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
