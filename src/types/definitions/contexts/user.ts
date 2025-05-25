import type { Dispatch, SetStateAction } from 'react'
import type { OrderMade, OrderReceived } from '../orders'
import type { BrowserSafeMerchantProduct } from '../products'
import type {
	BrowserSafeCompositeUser,
	BrowserSafeCustomerProfile,
	BrowserSafeInvitationReceived,
	BrowserSafeInvitationSent,
	BrowserSafeMerchantProfile,
} from '../users'

export interface UserContextType {
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
}

export type DemoUserContextType = Omit<UserContextType, 'user' | 'setUser'> & {
	customer: BrowserSafeCompositeUser
	setCustomer: Dispatch<SetStateAction<BrowserSafeCompositeUser>>
	merchant: BrowserSafeCompositeUser
	setMerchant: Dispatch<SetStateAction<BrowserSafeCompositeUser>>
	resolvedUser: BrowserSafeCompositeUser
}
