import { createCutOffTime } from '@/library/utilities/public'
import type { BrowserSafeCompositeUser } from '@/types'
import { defaultMinimumSpendPence } from './minimumSpend'

const sixPM = createCutOffTime({ hours: 18, minutes: 0 })

export const demoMerchantUser: BrowserSafeCompositeUser = {
	firstName: 'Jane',
	lastName: 'Smith',
	email: 'jane@janesbakery.com',
	roles: 'merchant',
	businessName: "Jane's Bakery",
	slug: 'janes-bakery',
	emailConfirmed: true,
	cutOffTime: sixPM,
	leadTimeDays: 1,
	minimumSpendPence: defaultMinimumSpendPence,
}

export const demoCustomerUser: BrowserSafeCompositeUser = {
	firstName: 'Grand',
	lastName: 'Hotel',
	email: 'purchasing@grandhotel.com',
	roles: 'customer',
	businessName: 'The Grand Hotel',
	slug: 'the-grand-hotel',
	emailConfirmed: true,
	cutOffTime: sixPM,
	leadTimeDays: 1,
	minimumSpendPence: defaultMinimumSpendPence,
}
