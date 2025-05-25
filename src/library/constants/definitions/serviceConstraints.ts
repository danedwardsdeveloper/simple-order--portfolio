export const serviceConstraints = {
	maximumCustomers: 100,
	maximumProducts: 100,
	highestVat: 50,
	maximumProductValueInMinorUnits: 1_000_00, // £1,000
	maximumOrderValueInMinorUnits: 10_000_00, // £10,000
	maximumProductDescriptionCharacters: 500,
	maximumCustomerNoteLength: 500,
} as const
