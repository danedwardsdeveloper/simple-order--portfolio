'use client'
import { demoConfirmedCustomers, demoCustomer, demoInventory, demoInvitationsSent, demoMerchant, temporaryVat } from '@/library/constants'
import type {
	BrowserSafeCompositeUser,
	BrowserSafeCustomerProfile,
	BrowserSafeInvitationReceived,
	BrowserSafeInvitationSent,
	BrowserSafeMerchantProduct,
	BrowserSafeMerchantProfile,
	DemoUserContextType,
	OrderMade,
	OrderReceived,
} from '@/types'
import { type ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { useUi } from '../ui'

export const DemoUserContext = createContext<DemoUserContextType>({} as DemoUserContextType)

export const DemoUserProvider = ({ children }: { children: ReactNode }) => {
	const { merchantMode } = useUi()
	const [demoUser, setDemoUser] = useState<BrowserSafeCompositeUser>(merchantMode ? demoMerchant : demoCustomer)

	const [inventory, setInventory] = useState<BrowserSafeMerchantProduct[] | null>(demoInventory)

	const [confirmedMerchants, setConfirmedMerchants] = useState<BrowserSafeMerchantProfile[] | null>(null)

	const [confirmedCustomers, setConfirmedCustomers] = useState<BrowserSafeCustomerProfile[] | null>(demoConfirmedCustomers)

	const [invitationsReceived, setInvitationsReceived] = useState<BrowserSafeInvitationReceived[] | null>(null)

	const [invitationsSent, setInvitationsSent] = useState<BrowserSafeInvitationSent[] | null>(demoInvitationsSent)

	const [ordersMade, setOrdersMade] = useState<OrderMade[] | null>(null)

	const [ordersReceived, setOrdersReceived] = useState<OrderReceived[] | null>(null)

	// Swap data when mode changes
	useEffect(() => {
		setDemoUser(merchantMode ? demoMerchant : demoCustomer)
	}, [merchantMode])

	return (
		<DemoUserContext.Provider
			value={{
				demoUser,
				setDemoUser,

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
		</DemoUserContext.Provider>
	)
}

export const useDemoUser = () => {
	const context = useContext(DemoUserContext)
	if (context === undefined) throw new Error('useDemoUser must be used within the DemoUserProvider')
	return context
}
