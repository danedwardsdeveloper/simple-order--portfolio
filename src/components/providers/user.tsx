'use client'
import type { VerifyTokenGETresponse } from '@/app/api/authentication/verify-token/route'
import type { InventoryAdminGETresponse } from '@/app/api/inventory/get'
import type { InvitationsGETresponse } from '@/app/api/invitations/route'
import type { OrdersAdminGETresponse } from '@/app/api/orders/admin/get'
import type { OrdersGETresponse } from '@/app/api/orders/get'
import type { RelationshipsGETresponse } from '@/app/api/relationships/route'
import { temporaryVat } from '@/library/constants'
import logger from '@/library/logger'
import { apiRequest } from '@/library/utilities/public'
import type {
	BrowserSafeCompositeUser,
	BrowserSafeCustomerProfile,
	BrowserSafeInvitationReceived,
	BrowserSafeInvitationSent,
	BrowserSafeMerchantProduct,
	BrowserSafeMerchantProfile,
	OrderMade,
	OrderReceived,
	UserContextType,
} from '@/types'
import { type ReactNode, createContext, useContext, useEffect, useRef, useState } from 'react'
import { useLoading } from './loading'
import { useUi } from './ui'

export const UserContext = createContext<UserContextType>({} as UserContextType)

export const UserProvider = ({ children }: { children: ReactNode }) => {
	const { setDataLoading } = useLoading()
	const { setMerchantMode } = useUi()
	const hasCheckedToken = useRef(false)

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
			setDataLoading(true)

			try {
				const { user } = await apiRequest<VerifyTokenGETresponse>({
					basePath: '/authentication/verify-token',
				})

				if (user) {
					setUser(user)

					const basePromises = [getRelationships(), getInvitations()]
					const customerPromises = [getOrdersMade()]
					const merchantPromises = [getInventory(), getOrdersReceived()]
					const bothPromises = [...customerPromises, ...merchantPromises]

					let rolePromises: Promise<void>[] = []

					if (user.roles === 'customer') {
						rolePromises = customerPromises
						setMerchantMode(false)
					} else if (user.roles === 'merchant') {
						rolePromises = merchantPromises
						setMerchantMode(true)
					} else {
						rolePromises = bothPromises
					}

					await Promise.all([...basePromises, ...rolePromises])
				}
			} finally {
				setDataLoading(false)
			}
		}

		async function getRelationships() {
			const { customers, merchants } = await apiRequest<RelationshipsGETresponse>({
				basePath: '/relationships',
			})

			setConfirmedMerchants(merchants || null)
			setConfirmedCustomers(customers || null)
		}

		async function getInvitations() {
			const { invitationsSent, invitationsReceived } = await apiRequest<InvitationsGETresponse>({
				basePath: '/invitations',
			})

			setInvitationsSent(invitationsSent || null)
			setInvitationsReceived(invitationsReceived || null)
		}

		async function getInventory() {
			// ToDo: refactor this
			try {
				const { inventory } = await apiRequest<InventoryAdminGETresponse>({
					basePath: '/inventory',
				})

				if (inventory) setInventory(inventory)
			} catch {
				// Log error
				logger.error('ToDo')
			}
		}

		async function getOrdersMade() {
			const { ordersMade } = await apiRequest<OrdersGETresponse>({ basePath: '/orders' })

			if (ordersMade) setOrdersMade(ordersMade)
		}

		async function getOrdersReceived() {
			const { ordersReceived } = await apiRequest<OrdersAdminGETresponse>({
				basePath: '/orders/admin',
			})

			if (ordersReceived) setOrdersReceived(ordersReceived)
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
