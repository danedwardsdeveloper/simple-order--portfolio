// Work in progress
// I have no idea what data I actually need!

export const fullClientSafeUser = {
	firstName: '',
	lastName: '',
	email: '',
	businessName: '',
	emailConfirmed: false,
	merchantDetails: {
		slug: '', // Not sure this is needed
		freeTrialExpiry: new Date(), // Not sure I need this!
		customersAsMerchant: [],
	},
	merchantsAsCustomer: [
		{
			id: 17, // Probably don't use the ID
			// Slug maybe?
			businessName: `Jane's Bakery`,
			emailConfirmed: true,
		},
	],
	inventory: [
		{
			id: 0, // Use the id as it's the only guaranteed unique property (for the map key)
			name: '',
			description: null,
			priceInMinorUnits: 0,
			customVat: null,
		},
	],
}

/*
Data I actually need to display
- Free trial end date/ time remaining
- 


*/
