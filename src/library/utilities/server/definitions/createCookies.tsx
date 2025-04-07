import { cookieDurations, cookieNames } from '@/library/constants'
import { isProduction } from '@/library/environment/publicVariables'
import { jwtSecret } from '@/library/environment/serverVariables'
import type { BaseCookieOptions, CookieDurations, CookieOptions } from '@/types'
import jwt, { type JwtPayload } from 'jsonwebtoken'

const baseCookieOptions: BaseCookieOptions = {
	name: cookieNames.token,
	httpOnly: true,
	secure: isProduction,
	sameSite: 'strict',
	path: '/',
} as const

export function createCookieOptions(tokenValue: string, duration: CookieDurations): CookieOptions {
	return {
		name: cookieNames.token,
		value: tokenValue,
		httpOnly: true,
		secure: isProduction,
		sameSite: 'strict',
		path: '/',
		maxAge: duration,
	}
}

function generateTokenPayload(userId: number, duration: CookieDurations): JwtPayload {
	return {
		sub: String(userId),
		exp: Math.floor(Date.now() / 1000) + duration,
	}
}

export function createCookieWithToken(userId: number, duration: CookieDurations): CookieOptions {
	const payload = generateTokenPayload(userId, duration)
	const token = jwt.sign(payload, jwtSecret)

	return {
		...baseCookieOptions,
		value: token,
		maxAge: duration,
	}
}

export function createDeletedCookie(): CookieOptions {
	return {
		...baseCookieOptions,
		value: '',
		maxAge: cookieDurations.zero,
	}
}
