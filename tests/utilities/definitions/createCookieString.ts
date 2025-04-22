import { cookieDurations } from '@/library/constants'
import { createCookieWithToken } from '@/library/utilities/server'
import { serialize } from 'cookie'

/**
 * @example 
const requestCookie = createCookieString({ userId: 1, expired: true })
 */
export function createCookieString({ userId, expired = false }: { userId: number; expired?: boolean }) {
	const cookieOptions = createCookieWithToken(userId, cookieDurations.oneYear)
	return serialize(cookieOptions.name, cookieOptions.value, {
		httpOnly: cookieOptions.httpOnly,
		secure: cookieOptions.secure,
		sameSite: cookieOptions.sameSite,
		path: cookieOptions.path,
		maxAge: expired ? -1 : cookieOptions.maxAge,
	})
}
