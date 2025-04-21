import logger from '@/library/logger'
import type { ParsedSetCookie } from '@/types'
import setCookieParser from 'set-cookie-parser'

/**
 * @param cookieString The raw cookie string from response headers
 * @returns The parsed token cookie object or null if not found
 */
export function parseTokenCookie(cookieString: string | null): ParsedSetCookie | null {
	if (!cookieString) return null

	try {
		const splitCookies = setCookieParser.splitCookiesString(cookieString)
		const parsedCookies = setCookieParser.parse(splitCookies)
		const tokenCookie = parsedCookies.find((cookie) => cookie.name === 'token')
		return tokenCookie || null
	} catch (error) {
		logger.error('Error parsing cookie:', error)
		return null
	}
}
