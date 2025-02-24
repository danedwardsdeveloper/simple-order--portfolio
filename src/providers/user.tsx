'use client'
import type { VerifyTokenGETresponse } from '@/app/api/authentication/verify-token/route'
import SplashScreen from '@/components/SplashScreen'
import { apiPaths, temporaryVat } from '@/library/constants'
import logger from '@/library/logger'
import type { BaseBrowserSafeUser, BrowserSafeMerchantProduct, BrowserSafeMerchantProfile } from '@/types'
import { type Dispatch, type ReactNode, type SetStateAction, createContext, useContext, useEffect, useState } from 'react'

interface UserContextType {
	user: BaseBrowserSafeUser | null
	setUser: Dispatch<SetStateAction<BaseBrowserSafeUser | null>>
	inventory: BrowserSafeMerchantProduct[] | null
	setInventory: Dispatch<SetStateAction<BrowserSafeMerchantProduct[] | null>>
	confirmedMerchants: BrowserSafeMerchantProfile[] | null
	setConfirmedMerchants: Dispatch<SetStateAction<BrowserSafeMerchantProfile[] | null>>
	pendingMerchants: BrowserSafeMerchantProfile[] | null
	setPendingMerchants: Dispatch<SetStateAction<BrowserSafeMerchantProfile[] | null>>
	isLoading: boolean
	vat: number
}

const UserContext = createContext<UserContextType>({} as UserContextType)

export const UserProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<BaseBrowserSafeUser | null>(null)
	const [inventory, setInventory] = useState<BrowserSafeMerchantProduct[] | null>(null)
	const [confirmedMerchants, setConfirmedMerchants] = useState<BrowserSafeMerchantProfile[] | null>(null)
	const [pendingMerchants, setPendingMerchants] = useState<BrowserSafeMerchantProfile[] | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		async function getUser() {
			setIsLoading(true)
			try {
				const { user }: VerifyTokenGETresponse = await (await fetch(apiPaths.authentication.verifyToken, { credentials: 'include' })).json()
				if (user) {
					logger.info('Found user: ', user.firstName)
					setUser(user)
				}
			} catch (error) {
				logger.error(`User provider ${apiPaths.authentication.verifyToken}`, error)
			} finally {
				setIsLoading(false)
			}
		}
		if (!user) getUser()
	}, [user])

	return (
		<UserContext.Provider
			value={{
				user,
				setUser,
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
		</UserContext.Provider>
	)
}

export const useUser = () => {
	const context = useContext(UserContext)
	if (context === undefined) throw new Error('useUser must be used within the UserProvider')
	return context
}
