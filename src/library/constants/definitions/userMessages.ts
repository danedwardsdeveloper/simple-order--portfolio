/**
 * Grammarly-check user-friendly messages that can be rendered on the browser
 */
export const userMessages = {
	emailTaken: 'This email address is already in use. Please try a different one or sign in.',
	allowedCharacters: "Please only use letters, numbers, and basic punctuation (', ., !, ?, -)",
	businessNameTaken: 'This business name is already taken. Please choose another.',
	databaseError: 'Sorry, something went wrong. Please try again later.',
	serverError: 'Sorry, something went wrong. Please try again later.',
	signedOutSuccessfully: 'You have been signed out.',
	stripeCreateCheckoutError: "Sorry, we weren't able to redirect you to our payment provider, Stripe. Please try again later.",
	stripeCheckoutSuccess: 'Thank you for subscribing to SimpleOrder.co.uk!',
	stripeCheckoutIncomplete: "Your subscription wasn't started. No payment has been taken",
	orderCreationError: 'Sorry, something went wrong trying to create a new order. Please try again later.',
	emailConfirmationTokenInvalid: 'ToDo',
	emailAlreadyConfirmed: 'This email address has already been confirmed.',
	cutOffTimeExceeded: `Sorry, it's too late to place this order. Please change the requested delivery date or contact the merchant directly.`,
	holidayConflict: 'This holiday period overlaps with an existing holiday',
} as const

/**
 * Notification messages used in both user and demo providers
 */
export const userNotifications = {
	settingsUpdated: {
		cutOffMessage: 'Cut off time updated',
		minimumSpendMessage: 'Minimum spend updated',
		holidayAddedMessage: 'Holiday added',
		leadTimeDaysMessage: 'Lead time updated',
		deliveryDaysMessage: 'Accepted delivery days updated',
	},
}
