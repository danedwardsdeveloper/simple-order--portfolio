'use client'
import type { VerifyTokenGETresponse } from '@/app/api/authentication/verify-token/get'
import { apiRequestNew } from '@/library/utilities/public'
import type { UserContextSetters, UserContextType, UserData } from '@/types'
import { type ReactNode, createContext, useContext, useEffect, useRef, useState } from 'react'
import { useLoading } from './loading'
import { useNotifications } from './notifications'
import { useUi } from './ui'

export const UserContext = createContext<UserContextType>({} as UserContextType)

export const UserProvider = ({ children }: { children: ReactNode }) => {
	const { setDataLoading } = useLoading()
	const { setMerchantModeFromRoles } = useUi()
	const { errorNotification } = useNotifications()
	const hasCheckedToken = useRef(false)
	const [user, setUser] = useState<UserContextType['user']>(null)

	const [inventory, setInventory] = useState<UserContextType['inventory']>(null)

	const [confirmedMerchants, setConfirmedMerchants] = useState<UserContextType['confirmedMerchants']>(null)

	const [confirmedCustomers, setConfirmedCustomers] = useState<UserContextType['confirmedCustomers']>(null)

	const [invitationsReceived, setInvitationsReceived] = useState<UserContextType['invitationsReceived']>(null)

	const [invitationsSent, setInvitationsSent] = useState<UserContextType['invitationsSent']>(null)

	const [ordersMade, setOrdersMade] = useState<UserContextType['ordersMade']>(null)

	const [ordersReceived, setOrdersReceived] = useState<UserContextType['ordersReceived']>(null)

	// biome-ignore lint/correctness/useExhaustiveDependencies: <Run on mount only>
	useEffect(() => {
		async function getUser() {
			setDataLoading(true)

			try {
				const { ok, userData, userMessage } = await apiRequestNew<VerifyTokenGETresponse>({
					basePath: '/authentication/verify-token',
				})

				if (ok && userData) {
					updateUserData(userData, {
						setUser,
						setInventory,
						setConfirmedMerchants,
						setConfirmedCustomers,
						setInvitationsReceived,
						setInvitationsSent,
						setOrdersMade,
						setOrdersReceived,
					})

					setMerchantModeFromRoles(userData.user?.roles)
				}

				if (!ok) {
					errorNotification(userMessage)
				}
			} finally {
				setDataLoading(false)
			}
		}

		if (!user && !hasCheckedToken.current) {
			hasCheckedToken.current = true
			getUser()
		}
	}, [])

	return (
		<UserContext.Provider
			value={{
				user,
				setUser,

				inventory,
				setInventory,

				confirmedMerchants,
				setConfirmedMerchants,

				confirmedCustomers,
				setConfirmedCustomers,

				invitationsReceived,
				setInvitationsReceived,

				invitationsSent,
				setInvitationsSent,

				ordersMade,
				setOrdersMade,

				ordersReceived,
				setOrdersReceived,
			}}
		>
			{children}
		</UserContext.Provider>
	)
}

/**
 * Convenience utility to update all properties at once. Used by sign-in & verify-token
 */
function updateUserData(userData: UserData, setters: UserContextSetters) {
	setters.setUser(userData.user)
	setters.setInventory(userData.inventory)
	setters.setConfirmedMerchants(userData.confirmedMerchants)
	setters.setConfirmedCustomers(userData.confirmedCustomers)
	setters.setInvitationsReceived(userData.invitationsReceived)
	setters.setInvitationsSent(userData.invitationsSent)
	setters.setOrdersMade(userData.ordersMade)
	setters.setOrdersReceived(userData.ordersReceived)
}

export const useUser = () => {
	const context = useContext(UserContext)
	if (context === undefined) throw new Error('useUser must be used within the UserProvider')
	return context
}

export { updateUserData }
