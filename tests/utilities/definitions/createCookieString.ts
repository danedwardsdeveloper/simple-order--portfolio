import { cookieDurations } from '@/library/constants'
import { createCookieWithToken } from '@/library/utilities/server'

/**
 * 
 * @example 
const requestCookie = createCookieString({userId: createdUser.id})
 */
export function createCookieString({
	userId,
}: {
	userId: number
}) {
	const cookieOptions = createCookieWithToken(userId, cookieDurations.oneYear)
	const validCookie = `${cookieOptions.name}=${cookieOptions.value}`

	return validCookie
}
