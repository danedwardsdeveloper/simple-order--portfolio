export const serviceConstraints = {
	maximumCustomers: 50,
	maximumProducts: 50,
	highestVat: 50,
	maximumProductValueInMinorUnits: 1_000_00, // £1,000
	maximumOrderValueInMinorUnits: 10_000_00, // £10,000
	maximumProductDescriptionCharacters: 500,
	maximumCustomerNoteLength: 500,
	trialLength: 30,
} as const
