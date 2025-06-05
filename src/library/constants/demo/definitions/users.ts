import { defaultMinimumSpendPence, sixPm } from '@/library/constants'
import type { DemoUserContextType, Holiday } from '@/types'

export const demoMerchant: DemoUserContextType['merchant'] = {
	firstName: 'Jane',
	lastName: 'Smith',
	email: 'jane@janesbakery.com',
	roles: 'merchant',
	businessName: "Jane's Bakery",
	slug: 'janes-bakery',
	emailConfirmed: true,
	cutOffTime: sixPm,
	leadTimeDays: 1,
	minimumSpendPence: defaultMinimumSpendPence,
	trialEnd: null,
	subscriptionEnd: null, // ToDo!
	subscriptionCancelled: false,
}

export const demoCustomer: DemoUserContextType['customer'] = {
	firstName: 'Grand',
	lastName: 'Hotel',
	email: 'purchasing@grandhotel.com',
	roles: 'customer',
	businessName: 'The Grand Hotel',
	emailConfirmed: true,

	// Set but not used
	slug: 'the-grand-hotel',
	cutOffTime: sixPm,
	leadTimeDays: 1,
	minimumSpendPence: defaultMinimumSpendPence,
	trialEnd: null,
	subscriptionEnd: null,
	subscriptionCancelled: false,
}

export const demoConfirmedCustomers: DemoUserContextType['confirmedCustomers'] = [
	{
		businessName: demoCustomer.businessName,
		obfuscatedEmail: 'pur****ing@gr****otel.com',
	},
]

export const demoInvitationsSent: DemoUserContextType['invitationsSent'] = [
	{
		obfuscatedEmail: 'orders@riversidecafes.com',
		lastEmailSentDate: new Date(), // ToDo
		expirationDate: new Date(),
	},
]

// Don't use utilities in /constants
export const demoHolidays: Holiday[] = [
	{
		startDate: new Date(2025, 11, 20), // December 20, 2025
		endDate: new Date(2026, 0, 4), // January 4, 2026
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
