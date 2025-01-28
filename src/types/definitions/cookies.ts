export const cookieNames = {
  token: 'token',
} as const

export type CookieNames = (typeof cookieNames)[keyof typeof cookieNames]

export const cookieDurations = {
  zero: 0,
  twoHours: 2 * 60 * 60,
  oneYear: 365 * 24 * 60 * 60,
} as const

export type CookieDurations = (typeof cookieDurations)[keyof typeof cookieDurations]

export type BaseCookieOptions = {
  name: CookieNames
  httpOnly: true
  secure: boolean
  sameSite: 'strict'
  path: string
}

export type CookieOptions = BaseCookieOptions & {
  value: string
  maxAge?: CookieDurations
}

export interface TokenPayload {
  sub: number
  exp: number
}
