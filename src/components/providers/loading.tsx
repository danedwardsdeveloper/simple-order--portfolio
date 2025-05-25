'use client'
import logger from '@/library/logger'
import { type Dispatch, type ReactNode, type SetStateAction, createContext, useContext, useEffect, useState } from 'react'

interface LoadingContextType {
	dataLoading: boolean
	setDataLoading: Dispatch<SetStateAction<boolean>>

	siteSplashExists: boolean
	showSiteSplash: boolean

	contentSplashExists: boolean
	showContentSplash: boolean
}

const initialLoadingContext: LoadingContextType = {
	dataLoading: false,
	setDataLoading: () => {},

	siteSplashExists: true,
	showSiteSplash: true,

	contentSplashExists: false,
	showContentSplash: false,
}

export const LoadingContext = createContext<LoadingContextType>(initialLoadingContext)

/**
 * Update Sunday 25 May, 2025. This is a fantastic, flawless system that results in a polished UI without flickering or obscuring the menubar
 */
export function LoadingProvider({ children }: { children: ReactNode }) {
	const [siteLoading, setSiteLoading] = useState<boolean>(() => {
		if (typeof window !== 'undefined') {
			return document.fonts.status !== 'loaded'
		}
		return true
	})
	const [dataLoading, setDataLoading] = useState<boolean>(false)
	const [siteSplashExists, setSplashExists] = useState(true)
	const [contentSplashExists, setContentSplashExists] = useState(false)

	const forceSiteSplash = false
	const forceContentSplash = false

	const showSiteSplash = forceSiteSplash || siteLoading
	const showContentSplash = forceContentSplash || dataLoading

	useEffect(() => {
		if (document.fonts.status === 'loaded') {
			setSiteLoading(false)
			return
		}

		const fontsPromise = document.fonts.ready

		// Always show the splash for nearly a second for a more professional presentation
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
