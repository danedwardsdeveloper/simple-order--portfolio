'use client'
import type { VerifyTokenGETresponse } from '@/app/api/authentication/verify-token/route'
import SplashScreen from '@/components/SplashScreen'
import { apiPaths, temporaryVat } from '@/library/constants'
import logger from '@/library/logger'
import type {
	BrowserSafeCompositeUser,
	BrowserSafeCustomerProfile,
	BrowserSafeMerchantProduct,
	BrowserSafeMerchantProfile,
	MerchantFacingInvitationRecord,
} from '@/types'
import { type Dispatch, type ReactNode, type SetStateAction, createContext, useContext, useEffect, useState } from 'react'
import { useUi } from './ui'

interface UserContextType {
	user: BrowserSafeCompositeUser | null
	setUser: Dispatch<SetStateAction<BrowserSafeCompositeUser | null>>

	// Enhancement ToDo: add caching & revalidation with React Query

	inventory: BrowserSafeMerchantProduct[] | null
	setInventory: Dispatch<SetStateAction<BrowserSafeMerchantProduct[] | null>>
	hasAttemptedInventoryFetch: boolean
	setHasAttemptedInventoryFetch: Dispatch<SetStateAction<boolean>>

	confirmedMerchants: BrowserSafeMerchantProfile[] | null
	setConfirmedMerchants: Dispatch<SetStateAction<BrowserSafeMerchantProfile[] | null>>
	pendingMerchants: BrowserSafeMerchantProfile[] | null
	setPendingMerchants: Dispatch<SetStateAction<BrowserSafeMerchantProfile[] | null>>
	hasAttemptedMerchantsFetch: boolean
	setHasAttemptedMerchantsFetch: Dispatch<SetStateAction<boolean>>

	confirmedCustomers: BrowserSafeCustomerProfile[] | null
	setConfirmedCustomers: Dispatch<SetStateAction<BrowserSafeCustomerProfile[] | null>>
	invitedCustomers: MerchantFacingInvitationRecord[] | null
	setInvitedCustomers: Dispatch<SetStateAction<MerchantFacingInvitationRecord[] | null>>
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
	const [inventory, setInventory] = useState<BrowserSafeMerchantProduct[] | null>(null)
	const [hasAttemptedInventoryFetch, setHasAttemptedInventoryFetch] = useState(false)

	const [confirmedMerchants, setConfirmedMerchants] = useState<BrowserSafeMerchantProfile[] | null>(null)
	const [pendingMerchants, setPendingMerchants] = useState<BrowserSafeMerchantProfile[] | null>(null)
	const [hasAttemptedMerchantsFetch, setHasAttemptedMerchantsFetch] = useState(false)

	const [confirmedCustomers, setConfirmedCustomers] = useState<BrowserSafeCustomerProfile[] | null>(null)
	const [invitedCustomers, setInvitedCustomers] = useState<MerchantFacingInvitationRecord[] | null>(null)
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
