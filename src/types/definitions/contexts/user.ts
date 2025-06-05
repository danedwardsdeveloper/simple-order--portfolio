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

export interface UserData {
	user: BrowserSafeCompositeUser | null
	inventory: BrowserSafeMerchantProduct[] | null
	confirmedMerchants: BrowserSafeMerchantProfile[] | null
	confirmedCustomers: BrowserSafeCustomerProfile[] | null
	invitationsReceived: BrowserSafeInvitationReceived[] | null
	invitationsSent: BrowserSafeInvitationSent[] | null
	ordersMade: OrderMade[] | null
	ordersReceived: OrderReceived[] | null
}

export interface UserContextSetters {
	setUser: Dispatch<SetStateAction<BrowserSafeCompositeUser | null>>
	setInventory: Dispatch<SetStateAction<BrowserSafeMerchantProduct[] | null>>
	setConfirmedMerchants: Dispatch<SetStateAction<BrowserSafeMerchantProfile[] | null>>
	setConfirmedCustomers: Dispatch<SetStateAction<BrowserSafeCustomerProfile[] | null>>
	setInvitationsReceived: Dispatch<SetStateAction<BrowserSafeInvitationReceived[] | null>>
	setInvitationsSent: Dispatch<SetStateAction<BrowserSafeInvitationSent[] | null>>
	setOrdersMade: Dispatch<SetStateAction<OrderMade[] | null>>
	setOrdersReceived: Dispatch<SetStateAction<OrderReceived[] | null>>
}

export type UserContextType = UserData & UserContextSetters

export type DemoUserContextType = Omit<UserContextType, 'user' | 'setUser'> & {
	customer: BrowserSafeCompositeUser
	setCustomer: Dispatch<SetStateAction<BrowserSafeCompositeUser>>
	merchant: BrowserSafeCompositeUser
	setMerchant: Dispatch<SetStateAction<BrowserSafeCompositeUser>>
	resolvedUser: BrowserSafeCompositeUser
}
