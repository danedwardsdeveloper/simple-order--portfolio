export const basicMessages = {
  databaseError: 'database error',
  parametersMissing: 'parameters missing',
  serverError: 'server error',
  success: 'success',
} as const

export type BasicMessages = (typeof basicMessages)[keyof typeof basicMessages]

export const authenticationMessages = {
  alreadyConfirmed: 'already confirmed',
  authorisationError: 'authorisation error',
  businessNameMissing: 'businessName missing',
  businessNameTaken: 'businessName taken',
  confirmationTokenMissing: 'confirmation token missing',
  emailMissing: 'email missing',
  emailNotConfirmed: 'email not confirmed',
  emailTaken: 'email taken',
  fistNameMissing: 'firstName missing',
  invalidCredentials: 'invalid credentials',
  lastNameMissing: 'lastName missing',
  passwordMissing: 'password missing',
  slugTaken: 'slug taken',
  tokenExpired: 'token expired',
  tokenInvalid: 'token invalid',
  tokenMissing: 'token missing',
  tokenUsed: 'token used',
  unauthorised: 'unauthorised',
  userNotFound: 'user not found',
} as const

export type AuthenticationMessages = (typeof authenticationMessages)[keyof typeof authenticationMessages]
