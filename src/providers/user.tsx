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

	// Enhancement ToDo: add caching & revalidation with React Query

	inventory: BrowserSafeMerchantProduct[] | null
	setInventory: Dispatch<SetStateAction<BrowserSafeMerchantProduct[]>>
	hasAttemptedInventoryFetch: boolean
	setHasAttemptedInventoryFetch: Dispatch<SetStateAction<boolean>>

	confirmedMerchants: BrowserSafeMerchantProfile[]
	setConfirmedMerchants: Dispatch<SetStateAction<BrowserSafeMerchantProfile[]>>
	pendingMerchants: BrowserSafeMerchantProfile[]
	setPendingMerchants: Dispatch<SetStateAction<BrowserSafeMerchantProfile[]>>
	hasAttemptedMerchantsFetch: boolean
	setHasAttemptedMerchantsFetch: Dispatch<SetStateAction<boolean>>

	confirmedCustomers: BrowserSafeCustomerProfile[]
	setConfirmedCustomers: Dispatch<SetStateAction<BrowserSafeCustomerProfile[]>>
	invitedCustomers: BrowserSafeInvitationRecord[]
	setInvitedCustomers: Dispatch<SetStateAction<BrowserSafeInvitationRecord[]>>
	hasAttemptedCustomersFetch: boolean
	setHasAttemptedCustomersFetch: Dispatch<SetStateAction<boolean>>

	vat: number
	isLoading: boolean
	showNoCustomersMessage: boolean
}

const UserContext = createContext<UserContextType>({} as UserContextType)

// ToDo: Change default states back to being null instead of empty arrays as it's confusing!

export const UserProvider = ({ children }: { children: ReactNode }) => {
	const { merchantMode } = useUi()
	const { setMerchantMode } = useUi()
	const [user, setUser] = useState<BrowserSafeCompositeUser | null>(null)
	const [inventory, setInventory] = useState<BrowserSafeMerchantProduct[]>([])
	const [hasAttemptedInventoryFetch, setHasAttemptedInventoryFetch] = useState(false)

	const [confirmedMerchants, setConfirmedMerchants] = useState<BrowserSafeMerchantProfile[]>([])
	const [pendingMerchants, setPendingMerchants] = useState<BrowserSafeMerchantProfile[]>([])
	const [hasAttemptedMerchantsFetch, setHasAttemptedMerchantsFetch] = useState(false)

	const [confirmedCustomers, setConfirmedCustomers] = useState<BrowserSafeCustomerProfile[]>([])
	const [invitedCustomers, setInvitedCustomers] = useState<BrowserSafeInvitationRecord[]>([])
	const [hasAttemptedCustomersFetch, setHasAttemptedCustomersFetch] = useState(false)

	const [isLoading, setIsLoading] = useState(true)

	const showNoCustomersMessage =
		!!(
			user &&
			hasAttemptedCustomersFetch &&
			!confirmedCustomers?.length &&
			!invitedCustomers?.length &&
			user.roles !== 'customer' &&
			merchantMode
		) || false

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
				hasAttemptedInventoryFetch,
				setHasAttemptedInventoryFetch,

				confirmedMerchants,
				setConfirmedMerchants,
				pendingMerchants,
				setPendingMerchants,
				hasAttemptedMerchantsFetch,
				setHasAttemptedMerchantsFetch,

				confirmedCustomers,
				setConfirmedCustomers,
				invitedCustomers,
				setInvitedCustomers,
				hasAttemptedCustomersFetch,
				setHasAttemptedCustomersFetch,

				isLoading,
				vat: temporaryVat,
				showNoCustomersMessage,
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
