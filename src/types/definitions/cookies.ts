import type { cookieDurations, cookieNames } from '@/library/constants'
import type { Cookie } from 'set-cookie-parser'
/** Renamed interface for testing
 */
export type ParsedSetCookie = Cookie

export type CookieNames = (typeof cookieNames)[keyof typeof cookieNames]

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
