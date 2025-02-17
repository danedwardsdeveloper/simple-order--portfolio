export const basicMessages = {
	databaseError: 'database error',
	parametersMissing: 'parameters missing',
	unknownTransactionError: 'unknown transaction error',
	serverError: 'server error',
	success: 'success',
} as const

export const authenticationMessages = {
	alreadyConfirmed: 'already confirmed',
	authorisationError: 'authorisation error',
	businessNameMissing: 'businessName missing',
	businessNameTaken: 'businessName taken',
	confirmationTokenMissing: 'confirmation token missing',
	emailInvalid: 'email invalid',
	emailMissing: 'email missing',
	emailNotConfirmed: 'email not confirmed',
	emailTaken: 'email taken',
	errorSendingEmail: 'error sending email',
	fistNameMissing: 'firstName missing',
	invalidCredentials: 'invalid credentials',
	lastNameMissing: 'lastName missing',
	merchantMissing: 'merchant profile missing',
	noActiveTrialSubscription: 'no active subscription or trial',
	notSignedIn: 'not signed in',
	passwordMissing: 'password missing',
	slugTaken: 'slug taken',
	tokenExpired: 'token expired',
	tokenInvalid: 'token invalid',
	tokenMissing: 'token missing',
	tokenUsed: 'token used',
	unauthorised: 'unauthorised',
	userNotFound: 'user not found',
} as const

export const illegalCharactersMessages = {
	firstName: 'firstName contains illegal characters',
	lastName: 'lastName contains illegal characters',
	password: 'password contains illegal characters',
	businessName: 'businessName contains illegal characters',
} as const
