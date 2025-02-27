export const testPasswords = {
	good: 'securePassword123',
	illegalCharacters: 'illegalP`password',
}

export const testUsers = {
	permanentBoth: {
		firstName: 'Samantha',
		lastName: 'Jones',
		email: 'permanentboth@gmail.com',
		businessName: "Samantha's Sauces",
	},
	permanentCustomer: {
		firstName: 'Charlotte',
		lastName: 'York',
		email: 'permanentcustomer@gmail.com',
		businessName: "Charlotte's Harlots",
	},
	permanentMerchant: {
		firstName: 'Miranda',
		lastName: 'Hobbes',
		email: 'permanentmerchant@gmail.com',
		businessName: "Miranda's Pandas",
	},
	customerOnly: {
		firstName: 'Jane',
		lastName: 'Pompermonterson',
		email: 'janepompermonterson@gmail.com',
		businessName: `Jane's Bakery`,
	},
	merchantOnly: {
		firstName: 'David',
		lastName: 'Agromberis',
		email: 'davidagromberis@gmail.com',
		businessName: `David's Stinky Cheeses`,
	},
	both: {
		firstName: 'Susan',
		lastName: 'Poodle',
		email: 'susanpoodle@gmail.com',
		businessName: `Susan's Spicey Sausages`,
	},
}

export function checkIsTestEmail(email: string): boolean {
	const normalizedEmail = email.trim().toLowerCase()
	return [
		testUsers.customerOnly.email,
		testUsers.merchantOnly.email,
		testUsers.both.email,
		testUsers.permanentBoth.email,
		testUsers.permanentCustomer.email,
		testUsers.permanentMerchant.email,
	]
		.map((email) => email.toLowerCase())
		.includes(normalizedEmail)
}
