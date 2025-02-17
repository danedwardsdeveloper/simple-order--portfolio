export const cookieNames = {
	token: 'token',
} as const

export const cookieDurations = {
	zero: 0,
	twoHours: 2 * 60 * 60,
	oneYear: 365 * 24 * 60 * 60,
} as const
