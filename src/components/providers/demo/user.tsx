'use client'
import { useUi } from '@/components/providers/ui'
import { temporaryVat } from '@/library/constants'
import {
	demoConfirmedCustomers,
	demoConfirmedMerchants,
	demoCustomer,
	demoInventory,
	demoInvitationsSent,
	demoMerchant,
	demoOrdersMade,
	demoOrdersReceived,
} from '@/library/constants/demo'
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

export const DemoUserContext = createContext<DemoUserContextType>({} as DemoUserContextType)

export const DemoUserProvider = ({ children }: { children: ReactNode }) => {
	const { merchantMode } = useUi()
	const [demoUser, setDemoUser] = useState<BrowserSafeCompositeUser>(merchantMode ? demoMerchant : demoCustomer)

	const [inventory, setInventory] = useState<BrowserSafeMerchantProduct[] | null>(demoInventory)

	const [confirmedMerchants, setConfirmedMerchants] = useState<BrowserSafeMerchantProfile[] | null>(demoConfirmedMerchants)

	const [confirmedCustomers, setConfirmedCustomers] = useState<BrowserSafeCustomerProfile[] | null>(demoConfirmedCustomers)

	const [invitationsReceived, setInvitationsReceived] = useState<BrowserSafeInvitationReceived[] | null>(null)

	const [invitationsSent, setInvitationsSent] = useState<BrowserSafeInvitationSent[] | null>(demoInvitationsSent)

	const [ordersMade, setOrdersMade] = useState<OrderMade[] | null>(demoOrdersMade)

	const [ordersReceived, setOrdersReceived] = useState<OrderReceived[] | null>(demoOrdersReceived)

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
