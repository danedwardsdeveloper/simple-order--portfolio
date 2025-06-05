'use client'
import { useUi } from '@/components/providers/ui'
import {
	demoConfirmedCustomers,
	demoCustomer,
	demoInventory,
	demoInvitationsSent,
	demoMerchant,
	demoOrdersMade,
	demoOrdersReceived,
} from '@/library/constants/demo'
import { createCutOffTime } from '@/library/shared'
import type { DemoUserContextType } from '@/types'
import { type ReactNode, createContext, useContext, useMemo, useState } from 'react'

export const DemoUserContext = createContext<DemoUserContextType>({} as DemoUserContextType)

export const DemoUserProvider = ({ children }: { children: ReactNode }) => {
	const { merchantMode } = useUi()

	const [customer, setCustomer] = useState<DemoUserContextType['customer']>(demoCustomer)
	const [merchant, setMerchant] = useState<DemoUserContextType['merchant']>(demoMerchant)

	const [inventory, setInventory] = useState<DemoUserContextType['inventory']>(demoInventory)

	const [_confirmedMerchants, setConfirmedMerchants] = useState<DemoUserContextType['confirmedMerchants']>(null)

	const [confirmedCustomers, setConfirmedCustomers] = useState<DemoUserContextType['confirmedCustomers']>(demoConfirmedCustomers)

	const [invitationsReceived, setInvitationsReceived] = useState<DemoUserContextType['invitationsReceived']>([])

	const [invitationsSent, setInvitationsSent] = useState<DemoUserContextType['invitationsSent']>(demoInvitationsSent)

	const [ordersMade, setOrdersMade] = useState<DemoUserContextType['ordersMade']>(demoOrdersMade)

	const [ordersReceived, setOrdersReceived] = useState<DemoUserContextType['ordersReceived']>(demoOrdersReceived)

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
