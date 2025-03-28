'use client'
import type { VerifyTokenGETresponse } from '@/app/api/authentication/verify-token/route'
import type { InventoryAdminGETresponse } from '@/app/api/inventory/admin/route'
import type { InvitationsGETresponse } from '@/app/api/invitations/route'
import type { OrdersAdminGETresponse } from '@/app/api/orders/admin/route'
import type { OrdersGETresponse } from '@/app/api/orders/route'
import type { RelationshipsGETresponse } from '@/app/api/relationships/route'
import { apiPaths, temporaryVat, userMessages } from '@/library/constants'
import logger from '@/library/logger'
import type {
	BrowserSafeCompositeUser,
	BrowserSafeCustomerProfile,
	BrowserSafeInvitationReceived,
	BrowserSafeInvitationSent,
	BrowserSafeMerchantProduct,
	BrowserSafeMerchantProfile,
	OrderMade,
	OrderReceived,
} from '@/types'
import { type Dispatch, type ReactNode, type SetStateAction, createContext, useContext, useEffect, useRef, useState } from 'react'
import { useNotifications } from './notifications'

interface UserContextType {
	user: BrowserSafeCompositeUser | null
	setUser: Dispatch<SetStateAction<BrowserSafeCompositeUser | null>>

	inventory: BrowserSafeMerchantProduct[] | null
	setInventory: Dispatch<SetStateAction<BrowserSafeMerchantProduct[] | null>>

	confirmedMerchants: BrowserSafeMerchantProfile[] | null
	setConfirmedMerchants: Dispatch<SetStateAction<BrowserSafeMerchantProfile[] | null>>

	confirmedCustomers: BrowserSafeCustomerProfile[] | null
	setConfirmedCustomers: Dispatch<SetStateAction<BrowserSafeCustomerProfile[] | null>>

	invitationsReceived: BrowserSafeInvitationReceived[] | null
	setInvitationsReceived: Dispatch<SetStateAction<BrowserSafeInvitationReceived[] | null>>

	invitationsSent: BrowserSafeInvitationSent[] | null
	setInvitationsSent: Dispatch<SetStateAction<BrowserSafeInvitationSent[] | null>>

	ordersMade: OrderMade[] | null
	setOrdersMade: Dispatch<SetStateAction<OrderMade[] | null>>

	ordersReceived: OrderReceived[] | null
	setOrdersReceived: Dispatch<SetStateAction<OrderReceived[] | null>>

	vat: number
	isLoading: boolean
}

const UserContext = createContext<UserContextType>({} as UserContextType)

export const UserProvider = ({ children }: { children: ReactNode }) => {
	const { createNotification } = useNotifications()
	const hasCheckedToken = useRef(false) // Prevent development issues
	const [isLoading, setIsLoading] = useState(true)

	const [user, setUser] = useState<BrowserSafeCompositeUser | null>(null)

	const [inventory, setInventory] = useState<BrowserSafeMerchantProduct[] | null>(null)

	const [confirmedMerchants, setConfirmedMerchants] = useState<BrowserSafeMerchantProfile[] | null>(null)

	const [confirmedCustomers, setConfirmedCustomers] = useState<BrowserSafeCustomerProfile[] | null>(null)

	const [invitationsReceived, setInvitationsReceived] = useState<BrowserSafeInvitationReceived[] | null>(null)

	const [invitationsSent, setInvitationsSent] = useState<BrowserSafeInvitationSent[] | null>(null)

	const [ordersMade, setOrdersMade] = useState<OrderMade[] | null>(null)

	const [ordersReceived, setOrdersReceived] = useState<OrderReceived[] | null>(null)

	// biome-ignore lint/correctness/useExhaustiveDependencies: <Run on mount only>
	useEffect(() => {
		async function getUser() {
			setIsLoading(true)
			try {
				const response = await fetch(apiPaths.authentication.verifyToken, { credentials: 'include' })
				const { user, message }: VerifyTokenGETresponse = await response.json()

				if (user) {
					setUser(user)

					const basePromises = [getRelationships(), getInvitations()]
					const rolePromises: Promise<void>[] =
						user.roles === 'customer'
							? [getOrdersMade()]
							: user.roles === 'merchant'
								? [getInventory(), getOrdersReceived()]
								: [getOrdersMade(), getOrdersReceived(), getInventory()]

					await Promise.all([...basePromises, ...rolePromises])
				} else if (message === 'token expired' || message === 'token invalid' || message === 'user not found') {
					createNotification({
						level: 'warning',
						title: 'Signed out',
						message: 'You have been signed out.',
					})
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

		async function getInvitations() {
			const invitationsURL = apiPaths.invitations.base
			try {
				const invitationsResponse = await fetch(invitationsURL, {
					credentials: 'include',
				})

				const { invitationsSent, invitationsReceived, message }: InvitationsGETresponse = await invitationsResponse.json()

				setInvitationsSent(invitationsSent || null)
				setInvitationsReceived(invitationsReceived || null)
				if (!invitationsResponse.ok) {
					logger.warn(`User provider ${invitationsURL}: request unsuccessful`, message)
				}
			} catch (error) {
				logger.error(`User provider ${invitationsURL}: `, error)
			}
		}

		async function getInventory() {
			// ToDo: refactor this
			try {
				const { inventory, message }: InventoryAdminGETresponse = await (
					await fetch(apiPaths.inventory.merchantPerspective.base, { credentials: 'include' })
				).json()

				if (inventory) setInventory(inventory)
				if (message !== 'success') logger.error('ToDo')
			} catch {
				// Log error
				logger.error('ToDo')
			}
		}

		async function getOrdersMade() {
			const { ordersMade, userMessage, developmentMessage }: OrdersGETresponse = await (
				await fetch(apiPaths.orders.customerPerspective.base, { credentials: 'include' })
			).json()

			if (ordersMade) setOrdersMade(ordersMade)

			if (userMessage) {
				createNotification({
					title: 'Error',
					message: userMessage,
					level: 'error',
				})
			}

			if (developmentMessage) logger.error('providers/user getOrdersMade error: ', developmentMessage)
		}

		async function getOrdersReceived() {
			const response = await fetch(apiPaths.orders.merchantPerspective.base, { credentials: 'include' })

			const { ordersReceived, userMessage }: OrdersAdminGETresponse = await response.json()

			if (response.ok) {
				setOrdersReceived(ordersReceived || null)
			} else {
				createNotification({
					title: 'Error',
					level: 'error',
					message: userMessage || userMessages.serverError,
				})
			}
		}

		if (!user && !hasCheckedToken.current) {
			getUser()
			hasCheckedToken.current = true
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

				isLoading,
				vat: temporaryVat,
			}}
		>
			{children}
		</UserContext.Provider>
	)
}

export const useUser = () => {
	const context = useContext(UserContext)
	if (context === undefined) throw new Error('useUser must be used within the UserProvider')
	return context
}
