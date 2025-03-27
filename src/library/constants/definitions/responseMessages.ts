/**
 * @deprecated Since 25 March 2025. This system is no longer being used.
 */
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

/**
 * @deprecated Since 25 March 2025. This system is no longer being used.
 */
export const unauthorisedMessages = {
	tokenExpired: systemMessages.tokenExpired,
	tokenInvalid: systemMessages.tokenInvalid,
	tokenMissing: systemMessages.tokenMissing,
	tokenUsed: systemMessages.tokenUsed,
	unauthorised: systemMessages.unauthorised,
	userNotFound: systemMessages.userNotFound,
} as const

/**
 * @deprecated Since 25 March 2025. This system is no longer being used.
 */
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

/**
 * @deprecated Since 25 March 2025. This system is no longer being used.
 */
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

/**
 * @deprecated Since 25 March 2025. This system is no longer being used.
 */
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

/**
 * @deprecated Since 25 March 2025. This system is no longer being used.
 */
export const illegalCharactersMessages = {
	businessName: 'businessName contains illegal characters',
	description: 'description contains illegal characters',
	firstName: 'firstName contains illegal characters',
	lastName: 'lastName contains illegal characters',
	name: 'name contains illegal characters',
	password: 'password contains illegal characters',
	customerNote: 'customerNote contains illegal characters',
} as const

/**
 * @deprecated Since 25 March 2025. This system is no longer being used.
 */
export const invalidFieldsMessages = {
	customerNote: 'customerNote invalid',
	requestedDelivery: 'requestedDeliveryDate invalid',
} as const

/**
 * @deprecated Since 25 March 2025. This system is no longer being used.
 */
export const tokenMessages = {
	userNotFound: 'user not found',
	tokenMissing: 'token missing',
	tokenExpired: 'token expired',
	tokenInvalid: 'token invalid',
	tokenUsed: 'token used',
} as const

/**
 * @deprecated Since 25 March 2025. This system is no longer being used.
 */
export const relationshipMessages = {
	relationshipExists: 'relationship exists',
	relationshipMissing: 'relationship missing',
} as const

/**
 * @deprecated Since 25 March 2025. This system is no longer being used.
 */
export const serviceConstraintMessages = {
	customerNoteTooLong: 'customerNote too long',
} as const
