import { createCutOffTime, obfuscateEmail } from '@/library/utilities/public'
import type { BrowserSafeCompositeUser, UserContextType } from '@/types'
import { defaultMinimumSpendPence } from './minimumSpend'

const sixPM = createCutOffTime({ hours: 18, minutes: 0 })

export const demoMerchant: BrowserSafeCompositeUser = {
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

export const demoCustomer: BrowserSafeCompositeUser = {
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

export const demoConfirmedCustomers: UserContextType['confirmedCustomers'] = [
	{
		businessName: demoCustomer.businessName,
		obfuscatedEmail: obfuscateEmail(demoCustomer.email),
	},
]

export const demoInvitationsSent: UserContextType['invitationsSent'] = [
	{
		obfuscatedEmail: 'orders@riversidecafes.com',
		lastEmailSentDate: new Date(), // ToDo
		expirationDate: new Date(),
	},
]

/*
// cspell:disable
The Grand Hotel - purchasing@thegrandhotel.co.uk
Riverside Café Chain - orders@riversidecafes.com
Hartley's Fine Dining - chef@hartleysdining.co.uk
Green Meadow Organic Market - produce@greenmeadowmarket.com
Northside Hospital Group - catering@northsidehospitals.org
Brightway Airlines - inflight-dining@brightwayair.com
Oakwood University - dining@oakwoodu.ac.uk
The Savoy Restaurant - kitchen@savoyrestaurant.co.uk
Morning Brew Coffee Shops - bakery@morningbrewcoffee.co.uk
Cheltenham Conference Centre - events@cheltenhamconferences.com
Harrington & Sons Delicatessen - orders@harringtondeli.co.uk
Westfield Shopping Centre - food-services@westfieldretail.com
Sunshine Childcare Centres - nutrition@sunshinechildcare.org
The Royal Theatre - hospitality@royaltheatre.org.uk
Alpine Ski Resorts - catering@alpineresorts.com
Bluewater Cruise Lines - provisions@bluewatercruises.com
Fairmont Hotel Collection - culinary@fairmonthotels.co.uk
St. James Medical Centre - cafeteria@stjamesmedical.nhs.uk
Evergreen Retirement Villages - dining@evergreenretirement.org
Blackstone Corporate Services - office-pantry@blackstonecorp.com
// cspell:enable
*/
