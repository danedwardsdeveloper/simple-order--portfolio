'use client'
import type { VerifyTokenGETresponse } from '@/app/api/authentication/verify-token/route'
import SplashScreen from '@/components/SplashScreen'
import { apiPaths, temporaryVat } from '@/library/constants'
import logger from '@/library/logger'
import type { BrowserSafeMerchantProduct, BrowserSafeMerchantProfile, FullBrowserSafeUser } from '@/types'
import { type ReactNode, createContext, useContext, useEffect, useState } from 'react'

// ToDo: rename this useUser
interface AuthorisationContextType {
	browserSafeUser: FullBrowserSafeUser | null
	setBrowserSafeUser: (user: FullBrowserSafeUser | null) => void
	inventory: BrowserSafeMerchantProduct[] | null
	setInventory: (inventory: BrowserSafeMerchantProduct[] | null) => void
	confirmedMerchants: BrowserSafeMerchantProfile[] | null
	setConfirmedMerchants: (confirmedMerchants: BrowserSafeMerchantProfile[] | null) => void
	pendingMerchants: BrowserSafeMerchantProfile[] | null
	setPendingMerchants: (pendingMerchants: BrowserSafeMerchantProfile[] | null) => void
	isLoading: boolean
	vat: number
}

const AuthorisationContext = createContext<AuthorisationContextType>({} as AuthorisationContextType)

export const AuthorisationProvider = ({ children }: { children: ReactNode }) => {
	const [browserSafeUser, setBrowserSafeUser] = useState<FullBrowserSafeUser | null>(null)
	const [inventory, setInventory] = useState<BrowserSafeMerchantProduct[] | null>(null)
	const [confirmedMerchants, setConfirmedMerchants] = useState<BrowserSafeMerchantProfile[] | null>(null)
	const [pendingMerchants, setPendingMerchants] = useState<BrowserSafeMerchantProfile[] | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		fetch(apiPaths.authentication.verifyToken, { credentials: 'include' })
			.then(async (response) => {
				if (response.ok) {
					const { browserSafeUser }: VerifyTokenGETresponse = await response.json()
					if (browserSafeUser) setBrowserSafeUser(browserSafeUser)
				}
			})
			.catch((error) => {
				logger.error('Authorisation check failed: ', error)
				setBrowserSafeUser(null)
			})
			.finally(() => setIsLoading(false))
	}, [])

	return (
		<AuthorisationContext.Provider
			value={{
				browserSafeUser,
				setBrowserSafeUser,
				inventory,
				setInventory,
				confirmedMerchants,
				setConfirmedMerchants,
				pendingMerchants,
				setPendingMerchants,
				isLoading,
				vat: temporaryVat,
			}}
		>
			<SplashScreen show={isLoading} />
			{children}
		</AuthorisationContext.Provider>
	)
}

export const useAuthorisation = () => {
	const context = useContext(AuthorisationContext)
	if (context === undefined) throw new Error('useAuthorisation must be used within the AuthorisationProvider')
	return context
}
