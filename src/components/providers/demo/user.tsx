'use client'
import { useUi } from '@/components/providers/ui'
import { temporaryVat } from '@/library/constants'
import {
	demoConfirmedCustomers,
	demoCustomer,
	demoInventory,
	demoInvitationsSent,
	demoMerchant,
	demoOrdersMade,
	demoOrdersReceived,
} from '@/library/constants/demo'
import { createCutOffTime } from '@/library/utilities/public'
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
import { type ReactNode, createContext, useContext, useMemo, useState } from 'react'

export const DemoUserContext = createContext<DemoUserContextType>({} as DemoUserContextType)

export const DemoUserProvider = ({ children }: { children: ReactNode }) => {
	const { merchantMode } = useUi()

	const [customer, setCustomer] = useState<BrowserSafeCompositeUser>(demoCustomer)
	const [merchant, setMerchant] = useState<BrowserSafeCompositeUser>(demoMerchant)

	const [inventory, setInventory] = useState<BrowserSafeMerchantProduct[] | null>(demoInventory)

	const [_confirmedMerchants, setConfirmedMerchants] = useState<BrowserSafeMerchantProfile[] | null>(null)

	const [confirmedCustomers, setConfirmedCustomers] = useState<BrowserSafeCustomerProfile[] | null>(demoConfirmedCustomers)

	const [invitationsReceived, setInvitationsReceived] = useState<BrowserSafeInvitationReceived[] | null>([])

	const [invitationsSent, setInvitationsSent] = useState<BrowserSafeInvitationSent[] | null>(demoInvitationsSent)

	const [ordersMade, setOrdersMade] = useState<OrderMade[] | null>(demoOrdersMade)

	const [ordersReceived, setOrdersReceived] = useState<OrderReceived[] | null>(demoOrdersReceived)

	const confirmedMerchants = useMemo(
		() => [
			{
				// This is kept in sync
				businessName: merchant.businessName,
				slug: merchant.slug,
				cutOffTime: merchant.cutOffTime,
				leadTimeDays: merchant.leadTimeDays,
				minimumSpendPence: merchant.minimumSpendPence,
			},
			{
				// This is static
				businessName: 'Crown & Bloom Flowers',
				slug: 'crown-and-bloom-flowers',
				cutOffTime: createCutOffTime({ hours: 14, minutes: 0 }),
				leadTimeDays: 1,
				minimumSpendPence: 10000,
			},
		],
		[merchant],
	)

	return (
		<DemoUserContext.Provider
			value={{
				customer,
				setCustomer,

				merchant,
				setMerchant,

				resolvedUser: merchantMode ? merchant : customer,

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
