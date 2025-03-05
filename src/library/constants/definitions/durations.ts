export const durationOptions = {
	oneYearInSeconds: 365 * 24 * 60 * 60,
	twentyFourHoursInMilliseconds: 24 * 60 * 60 * 1000,
	oneWeekInMilliseconds: 7 * 24 * 60 * 60 * 1000,
} as const

export const durationSettings = {
	confirmEmailExpiry: durationOptions.twentyFourHoursInMilliseconds,
	acceptInvitationExpiry: durationOptions.oneWeekInMilliseconds,
} as const
