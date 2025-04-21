interface Case {
	description: string
	options: {
		cookie: {
			useValid: boolean
			provide: boolean
		}
		itemId: {
			provide: boolean
			useValid: boolean
		}
	}
	expectedStatus: number
}

export const cases: Case[] = [
	{
		description: 'No cookie or itemId',
		expectedStatus: 405,
		options: {
			cookie: {
				useValid: false,
				provide: false,
			},
			itemId: {
				provide: false,
				useValid: false,
			},
		},
	},
	{
		description: 'Valid cookie, no itemId',
		expectedStatus: 405,
		options: {
			cookie: {
				useValid: true,
				provide: true,
			},
			itemId: {
				provide: false,
				useValid: false,
			},
		},
	},
	{
		description: 'Invalid cookie format, empty itemId',
		expectedStatus: 405,
		options: {
			cookie: {
				useValid: false,
				provide: true,
			},
			itemId: {
				provide: false,
				useValid: false,
			},
		},
	},
	{
		description: "Try to delete someone else's item",
		expectedStatus: 401,
		options: {
			cookie: {
				useValid: true,
				provide: true,
			},
			itemId: {
				provide: true,
				useValid: false,
			},
		},
	},
	{
		description: 'Valid request',
		expectedStatus: 200,
		options: {
			cookie: {
				useValid: true,
				provide: true,
			},
			itemId: {
				provide: true,
				useValid: true,
			},
		},
	},
]
