import type { Dispatch, SetStateAction } from 'react'
import type { Holiday } from './deliveryDays'
import type { OrderMade, OrderReceived } from './orders'
import type { BrowserSafeMerchantProduct } from './products'
import type { WeekDayIndex } from './timeDate'
import type {
	BrowserSafeCompositeUser,
	BrowserSafeCustomerProfile,
	BrowserSafeInvitationReceived,
	BrowserSafeInvitationSent,
	BrowserSafeMerchantProfile,
} from './users'

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
	demoUser: BrowserSafeCompositeUser
	setDemoUser: Dispatch<SetStateAction<BrowserSafeCompositeUser>>
}

export type SaveSetting<T1, T2 = void> = (value: T1, valueTwo?: T2) => Promise<boolean>

/**
 * For demo and application providers
 */
export type SettingsContextType = {
	// Settings data that isn't on the user object and has to be retrieved separately
	holidays: Holiday[] | null
	acceptedWeekDayIndices: WeekDayIndex[] | null

	// Data saving functions
	saveCutOffTime: SaveSetting<Date>
	saveLeadTime: SaveSetting<number>
	saveMinimumSpendPence: SaveSetting<number>
	addHoliday: SaveSetting<Date, Date>
	saveDeliveryDays: SaveSetting<number[]>
}
