export const basicMessages = {
	databaseError: 'database error',
	errorSendingEmail: 'error sending email',
	parametersMissing: 'parameters missing',
	serverError: 'server error',
	serviceUnavailable: 'service unavailable',
	success: 'success',
	unknownTransactionError: 'unknown transaction error',
} as const

export const missingFieldMessages = {
	lastNameMissing: 'lastName missing',
	firstNameMissing: 'firstName missing',
	emailMissing: 'email missing',
	businessNameMissing: 'businessName missing',
	passwordMissing: 'password missing',
	invitedEmailMissing: 'invitedEmail missing',
	merchantSlugMissing: 'merchantSlug missing',
} as const

export const authenticationMessages = {
	alreadyConfirmed: 'already confirmed',
	authorisationError: 'authorisation error',
	businessNameTaken: 'businessName taken',
	dataBelongsToOtherUser: 'data belongs to another user',
	invalidEmailFormat: 'invalid email format',
	emailNotConfirmed: 'email not confirmed',
	emailTaken: 'email taken',
	invalidCredentials: 'invalid credentials',
	merchantNotFound: 'merchant not found',
	noActiveTrialSubscription: 'no active subscription or trial',
	notSignedIn: 'not signed in',
	slugTaken: 'slug taken',
	unauthorised: 'unauthorised',
} as const

export const illegalCharactersMessages = {
	firstName: 'firstName contains illegal characters',
	lastName: 'lastName contains illegal characters',
	password: 'password contains illegal characters',
	businessName: 'businessName contains illegal characters',
} as const

export const tokenMessages = {
	userNotFound: 'user not found',
	tokenMissing: 'token missing',
	tokenExpired: 'token expired',
	tokenInvalid: 'token invalid',
} as const

export const relationshipMessages = {
	relationshipExists: 'relationship exists',
	relationshipMissing: 'relationship missing',
} as const

// Other potential response messages that could be reused
// - businessName not found
// - not a customer of this merchant
