'use client'
import { defaultMinimumSpendPence, temporaryVat } from '@/library/constants'
import { createCutOffTime } from '@/library/utilities/public'
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
import { type Dispatch, type ReactNode, type SetStateAction, createContext, useContext, useState } from 'react'

export const defaultDemoUser: BrowserSafeCompositeUser = {
	firstName: 'Martha',
	lastName: 'Stewart',
	email: 'marthastewart@marthastewart.com',
	roles: 'customer',
	businessName: 'Martha Stewart',
	slug: 'martha-stewart',
	emailConfirmed: true,
	cutOffTime: createCutOffTime({ hours: 18, minutes: 0 }),
	leadTimeDays: 1,
	minimumSpendPence: defaultMinimumSpendPence,
}

export interface DemoUserContextType {
	demoUser: BrowserSafeCompositeUser
	setDemoUser: Dispatch<SetStateAction<BrowserSafeCompositeUser>>

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
}

export const DemoUserContext = createContext<DemoUserContextType>({} as DemoUserContextType)

export const DemoUserProvider = ({ children }: { children: ReactNode }) => {
	const [demoUser, setDemoUser] = useState<BrowserSafeCompositeUser>(defaultDemoUser)

	const [inventory, setInventory] = useState<BrowserSafeMerchantProduct[] | null>(null)

	const [confirmedMerchants, setConfirmedMerchants] = useState<BrowserSafeMerchantProfile[] | null>(null)

	const [confirmedCustomers, setConfirmedCustomers] = useState<BrowserSafeCustomerProfile[] | null>(null)

	const [invitationsReceived, setInvitationsReceived] = useState<BrowserSafeInvitationReceived[] | null>(null)

	const [invitationsSent, setInvitationsSent] = useState<BrowserSafeInvitationSent[] | null>(null)

	const [ordersMade, setOrdersMade] = useState<OrderMade[] | null>(null)

	const [ordersReceived, setOrdersReceived] = useState<OrderReceived[] | null>(null)

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
