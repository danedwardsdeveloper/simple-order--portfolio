import { december, defaultMinimumSpendPence, january, sixPm } from '@/library/constants'
import { createDate, obfuscateEmail } from '@/library/utilities/public'
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
}

export const demoCustomer: DemoUserContextType['customer'] = {
	firstName: 'Grand',
	lastName: 'Hotel',
	email: 'purchasing@grandhotel.com',
	roles: 'customer',
	businessName: 'The Grand Hotel',
	slug: 'the-grand-hotel', // Set but not used
	emailConfirmed: true,
	cutOffTime: sixPm, // Set but not used
	leadTimeDays: 1, // Set but not used
	minimumSpendPence: defaultMinimumSpendPence, // Set but not used
}

export const demoConfirmedCustomers: DemoUserContextType['confirmedCustomers'] = [
	{
		businessName: demoCustomer.businessName,
		obfuscatedEmail: obfuscateEmail(demoCustomer.email),
	},
]

export const demoInvitationsSent: DemoUserContextType['invitationsSent'] = [
	{
		obfuscatedEmail: 'orders@riversidecafes.com',
		lastEmailSentDate: new Date(), // ToDo
		expirationDate: new Date(),
	},
]

export const demoHolidays: Holiday[] = [
	{
		startDate: createDate(20, december, 2025), //
		endDate: createDate(4, january, 2026),
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
