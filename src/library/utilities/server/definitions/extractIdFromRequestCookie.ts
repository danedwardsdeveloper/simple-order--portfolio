import jwt, { JsonWebTokenError, JwtPayload, TokenExpiredError } from 'jsonwebtoken'
import { NextRequest } from 'next/server'

import { jwtSecret } from '@/library/environment/serverVariables'
import logger from '@/library/logger'

import { AuthenticationMessages, authenticationMessages, BasicMessages, basicMessages, CookieNames, httpStatus } from '@/types'

export function extractIdFromRequestCookie(request: NextRequest): {
  extractedUserId?: number
  message: BasicMessages | AuthenticationMessages
  status: number
} {
  const accessToken = request.cookies.get('token' as CookieNames)?.value
  if (!accessToken) {
    return {
      message: authenticationMessages.tokenMissing,
      status: httpStatus.http200ok,
    }
  }

  try {
    const { sub } = jwt.verify(accessToken, jwtSecret) as JwtPayload
    if (!sub) {
      throw new JsonWebTokenError('Missing sub claim')
    }

    const extractedUserId = Number(sub)
    if (isNaN(extractedUserId)) {
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
        message: authenticationMessages.tokenExpired,
        status: httpStatus.http401unauthorised,
      }
    }
    if (error instanceof JsonWebTokenError) {
      logger.error('JSON web token error: ', error)
      return {
        message: authenticationMessages.tokenInvalid,
        status: httpStatus.http401unauthorised,
      }
    }
    logger.error('Unexpected error while verifying token: ', error)
    return {
      message: authenticationMessages.tokenInvalid,
      status: httpStatus.http401unauthorised,
    }
  }
}
