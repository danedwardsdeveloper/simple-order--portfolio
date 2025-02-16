export const testPasswords = {
	good: 'securePassword123',
	illegalCharacters: 'illegalP`password',
}

export const testUsers = {
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
	permanentTestUser: {
		firstName: 'Permanent',
		lastName: 'Test User',
		email: 'permanenttestuser@gmail.com',
		businessName: 'Permanent Business',
	},
}

export function checkIsTestEmail(email: string): boolean {
	const normalizedEmail = email.trim().toLowerCase()
	return [testUsers.customerOnly.email, testUsers.merchantOnly.email, testUsers.both.email, testUsers.permanentTestUser.email]
		.map((email) => email.toLowerCase())
		.includes(normalizedEmail)
}
