'use client'
import type { VerifyTokenGETresponse } from '@/app/api/authentication/verify-token/route'
import SplashScreen from '@/components/SplashScreen'
import { apiPaths, temporaryVat } from '@/library/constants'
import logger from '@/library/logger'
import type {
	BrowserSafeCompositeUser,
	BrowserSafeCustomerProfile,
	BrowserSafeInvitationRecord,
	BrowserSafeMerchantProduct,
	BrowserSafeMerchantProfile,
} from '@/types'
import { type Dispatch, type ReactNode, type SetStateAction, createContext, useContext, useEffect, useState } from 'react'
import { useUi } from './ui'

interface UserContextType {
	user: BrowserSafeCompositeUser | null
	setUser: Dispatch<SetStateAction<BrowserSafeCompositeUser | null>>

	inventory: BrowserSafeMerchantProduct[] | null
	setInventory: Dispatch<SetStateAction<BrowserSafeMerchantProduct[] | null>>

	confirmedMerchants: BrowserSafeMerchantProfile[] | null
	setConfirmedMerchants: Dispatch<SetStateAction<BrowserSafeMerchantProfile[] | null>>
	pendingMerchants: BrowserSafeMerchantProfile[] | null
	setPendingMerchants: Dispatch<SetStateAction<BrowserSafeMerchantProfile[] | null>>

	confirmedCustomers: BrowserSafeCustomerProfile[] | undefined
	setConfirmedCustomers: Dispatch<SetStateAction<BrowserSafeCustomerProfile[] | undefined>>
	invitedCustomers: BrowserSafeInvitationRecord[] | undefined
	setInvitedCustomers: Dispatch<SetStateAction<BrowserSafeInvitationRecord[] | undefined>>

	vat: number

	isLoading: boolean
}

const UserContext = createContext<UserContextType>({} as UserContextType)

export const UserProvider = ({ children }: { children: ReactNode }) => {
	const { setMerchantMode } = useUi()

	const [user, setUser] = useState<BrowserSafeCompositeUser | null>(null)
	const [inventory, setInventory] = useState<BrowserSafeMerchantProduct[] | null>(null)

	const [confirmedMerchants, setConfirmedMerchants] = useState<BrowserSafeMerchantProfile[] | null>(null)
	const [pendingMerchants, setPendingMerchants] = useState<BrowserSafeMerchantProfile[] | null>(null)

	const [confirmedCustomers, setConfirmedCustomers] = useState<BrowserSafeCustomerProfile[] | undefined>(undefined)
	const [invitedCustomers, setInvitedCustomers] = useState<BrowserSafeInvitationRecord[] | undefined>(undefined)

	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		async function getUser() {
			setIsLoading(true)
			try {
				const { user }: VerifyTokenGETresponse = await (await fetch(apiPaths.authentication.verifyToken, { credentials: 'include' })).json()
				if (user) {
					logger.info('Found user: ', user.firstName)
					setUser(user)

					// Enhancement ToDO: change this so that it remembers the last used state/recorded preference
					if (user.roles === 'both' || user.roles === 'merchant') {
						setMerchantMode(true)
					} else {
						setMerchantMode(false)
					}
				}
			} catch (error) {
				logger.error(`User provider ${apiPaths.authentication.verifyToken}`, error)
			} finally {
				setIsLoading(false)
			}
		}
		if (!user) getUser()
	}, [user, setMerchantMode])

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

				confirmedCustomers,
				setConfirmedCustomers,
				invitedCustomers,
				setInvitedCustomers,

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
