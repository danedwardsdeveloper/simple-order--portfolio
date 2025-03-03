'use client'
import type { VerifyTokenGETresponse } from '@/app/api/authentication/verify-token/route'
import type { RelationshipsGETresponse } from '@/app/api/relationships/route'
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

	inventory: BrowserSafeMerchantProduct[] | null
	setInventory: Dispatch<SetStateAction<BrowserSafeMerchantProduct[] | null>>
	hasAttemptedInventoryFetch: boolean
	setHasAttemptedInventoryFetch: Dispatch<SetStateAction<boolean>>

	confirmedMerchants: BrowserSafeMerchantProfile[] | null
	setConfirmedMerchants: Dispatch<SetStateAction<BrowserSafeMerchantProfile[] | null>>

	confirmedCustomers: BrowserSafeCustomerProfile[] | null
	setConfirmedCustomers: Dispatch<SetStateAction<BrowserSafeCustomerProfile[] | null>>

	pendingMerchants: BrowserSafeMerchantProfile[] | null
	setPendingMerchants: Dispatch<SetStateAction<BrowserSafeMerchantProfile[] | null>>

	invitedCustomers: MerchantFacingInvitationRecord[] | null
	setInvitedCustomers: Dispatch<SetStateAction<MerchantFacingInvitationRecord[] | null>>

	vat: number
	isLoading: boolean
}

const UserContext = createContext<UserContextType>({} as UserContextType)

// ToDo: Change default states back to being null instead of empty arrays as it's confusing!

export const UserProvider = ({ children }: { children: ReactNode }) => {
	const { setMerchantMode } = useUi()
	const [user, setUser] = useState<BrowserSafeCompositeUser | null>(null)
	const [inventory, setInventory] = useState<BrowserSafeMerchantProduct[] | null>(null)
	const [hasAttemptedInventoryFetch, setHasAttemptedInventoryFetch] = useState(false)

	const [confirmedMerchants, setConfirmedMerchants] = useState<BrowserSafeMerchantProfile[] | null>(null)
	const [pendingMerchants, setPendingMerchants] = useState<BrowserSafeMerchantProfile[] | null>(null)

	const [confirmedCustomers, setConfirmedCustomers] = useState<BrowserSafeCustomerProfile[] | null>(null)
	const [invitedCustomers, setInvitedCustomers] = useState<MerchantFacingInvitationRecord[] | null>(null)

	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		async function getUser() {
			setIsLoading(true)
			try {
				const { user }: VerifyTokenGETresponse = await (await fetch(apiPaths.authentication.verifyToken, { credentials: 'include' })).json()
				if (user) {
					setUser(user)

					// Enhancement ToDO: change this so that it remembers the last used state/recorded preference
					if (user.roles === 'both' || user.roles === 'merchant') {
						setMerchantMode(true)
					} else {
						setMerchantMode(false)
					}

					await getRelationships()
				}
			} catch (error) {
				logger.error(`User provider ${apiPaths.authentication.verifyToken}`, error)
			} finally {
				setIsLoading(false)
			}
		}

		async function getRelationships() {
			try {
				const { customers, merchants }: RelationshipsGETresponse = await (
					await fetch(apiPaths.relationships, { credentials: 'include' })
				).json()
				setConfirmedMerchants(merchants || null)
				setConfirmedCustomers(customers || null)
			} catch (error) {
				logger.error(`User provider ${apiPaths.relationships}`, error)
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

				confirmedCustomers,
				setConfirmedCustomers,

				pendingMerchants,
				setPendingMerchants,

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
