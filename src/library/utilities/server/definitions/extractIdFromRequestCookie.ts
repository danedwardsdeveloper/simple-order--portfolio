import { basicMessages, cookieNames, httpStatus, type systemMessages, tokenMessages } from '@/library/constants'
import { jwtSecret } from '@/library/environment/serverVariables'
import logger from '@/library/logger'
import type { UnauthorisedMessages } from '@/types'
import jwt, { JsonWebTokenError, type JwtPayload, TokenExpiredError } from 'jsonwebtoken'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

export async function extractIdFromRequestCookie(_request: NextRequest): Promise<{
	extractedUserId?: number
	message: UnauthorisedMessages | typeof systemMessages.success
	status: number
}> {
	const cookieStore = await cookies()
	const accessToken = cookieStore.get(cookieNames.token)

	if (!accessToken) {
		return {
			message: tokenMessages.tokenMissing,
			status: httpStatus.http200ok,
		}
	}

	try {
		const { sub } = jwt.verify(accessToken.value, jwtSecret) as JwtPayload
		if (!sub) {
			throw new JsonWebTokenError('Missing sub claim')
		}

		const extractedUserId = Number(sub)
		if (Number.isNaN(extractedUserId)) {
			throw new JsonWebTokenError('Invalid sub claim')
		}

		return {
			message: basicMessages.success,
			status: httpStatus.http200ok,
			extractedUserId,
		}
	} catch (error) {
		if (error instanceof TokenExpiredError) {
			return {
				message: tokenMessages.tokenExpired,
				status: httpStatus.http401unauthorised,
			}
		}
		if (error instanceof JsonWebTokenError) {
			logger.error('JSON web token error: ', error)
			return {
				message: tokenMessages.tokenInvalid,
				status: httpStatus.http401unauthorised,
			}
		}
		logger.error('extractIdFromRequestCookie error: ', error)
		return {
			message: tokenMessages.tokenInvalid,
			status: httpStatus.http401unauthorised,
		}
	}
}
