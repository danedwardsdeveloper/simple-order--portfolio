export const systemMessages = {
	badRequest: 'bad request',
	serverError: 'server error',
	databaseError: 'database error',
	success: 'success',
	successNoContent: 'success, no content',
	tokenExpired: 'token expired',
	tokenInvalid: 'token invalid',
	tokenMissing: 'token missing',
	tokenUsed: 'token used',
	unauthorised: 'unauthorised',
	userNotFound: 'user not found',
} as const

export const unauthorisedMessages = {
	tokenExpired: systemMessages.tokenExpired,
	tokenInvalid: systemMessages.tokenInvalid,
	tokenMissing: systemMessages.tokenMissing,
	tokenUsed: systemMessages.tokenUsed,
	unauthorised: systemMessages.unauthorised,
	userNotFound: systemMessages.userNotFound,
} as const

export const userMessages = {
	databaseError: 'Sorry, something went wrong. Please try again later.',
	serverError: 'Sorry, something went wrong. Please try again later.',
	noOrdersMade: "You haven't made any orders yet",
	noOrdersReceived: "You haven't received any orders yet",
} as const

// Everything below this comment is being phased out.

export const basicMessages = {
	databaseError: 'database error',
	errorSendingEmail: 'error sending email',
	parametersMissing: 'parameters missing',
	serverError: 'server error',
	serviceUnavailable: 'service unavailable',
	success: 'success',
	transactionError: 'transaction error',
	unknownTransactionError: 'unknown transaction error',
	error: 'error',
} as const

export const missingFieldMessages = {
	nameMissing: 'name missing',
	lastNameMissing: 'lastName missing',
	firstNameMissing: 'firstName missing',
	emailMissing: 'email missing',
	businessNameMissing: 'businessName missing',
	passwordMissing: 'password missing',
	priceMissing: 'priceInMinorUnits missing',
	productsMissing: 'products missing',
	invitedEmailMissing: 'invitedEmail missing',
	requestedDeliveryDateMissing: 'requestedDeliveryDate missing',
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
	businessName: 'businessName contains illegal characters',
	description: 'description contains illegal characters',
	firstName: 'firstName contains illegal characters',
	lastName: 'lastName contains illegal characters',
	name: 'name contains illegal characters',
	password: 'password contains illegal characters',
	customerNote: 'customerNote contains illegal characters',
} as const

export const invalidFieldsMessages = {
	customerNote: 'customerNote invalid',
	requestedDelivery: 'requestedDeliveryDate invalid',
} as const

export const tokenMessages = {
	userNotFound: 'user not found',
	tokenMissing: 'token missing',
	tokenExpired: 'token expired',
	tokenInvalid: 'token invalid',
	tokenUsed: 'token used',
} as const

export const relationshipMessages = {
	relationshipExists: 'relationship exists',
	relationshipMissing: 'relationship missing',
} as const

export const serviceConstraintMessages = {
	customerNoteTooLong: 'customerNote too long',
} as const
