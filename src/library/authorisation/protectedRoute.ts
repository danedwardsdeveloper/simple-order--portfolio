import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

import { CookieNames, TokenPayload } from '../cookies'
import { jwtSecret } from '../environment/serverVariables'
import logger from '../logger'
import { findUserById, User } from '../tempData/users'
import { AuthorisationMessages, BasicMessages, HttpStatus } from '@/types'

export default async function protectedRoute<
  T extends { message: BasicMessages | AuthorisationMessages | string },
>(
  request: NextRequest,
  confirmationRequired: 'require confirmation' | 'allow unconfirmed',
  handler: (authenticatedSafeUser: User, authenticatedRequest: NextRequest) => Promise<NextResponse<T>>,
): Promise<NextResponse<T>> {
  try {
    const accessToken = request.cookies.get('token' as CookieNames)?.value
    if (!accessToken) {
      logger.info('Access token not found')
      return NextResponse.json(
        { message: 'token missing' },
        {
          status: HttpStatus.http401unauthorised,
        },
      ) as NextResponse<T>
    }

    let decoded: TokenPayload
    try {
      const result = jwt.verify(accessToken, jwtSecret)
      decoded = {
        sub: Number(result.sub),
      } as TokenPayload
    } catch (error) {
      logger.info('JWT verification failed:', error)
      const message = error instanceof jwt.TokenExpiredError ? 'expired token' : 'invalid token'
      return NextResponse.json({ message }, { status: HttpStatus.http401unauthorised }) as NextResponse<T>
    }

    const existingUser = findUserById(decoded.sub)

    if (!existingUser) {
      logger.info(`User with id: ${decoded.sub} not found in database`)
      return NextResponse.json(
        { message: 'user not found' },
        {
          status: HttpStatus.http404notFound,
        },
      ) as NextResponse<T>
    }

    if (confirmationRequired === 'require confirmation' && !existingUser.emailConfirmed) {
      logger.info(`User ${existingUser.id} attempted to access route without confirmation`)
      return NextResponse.json(
        { message: 'email not confirmed' },
        {
          status: HttpStatus.http403forbidden,
        },
      ) as NextResponse<T>
    }

    return handler(existingUser, request)
  } catch (error) {
    logger.error('Error in protected route:', error instanceof Error ? error.message : 'Unknown server error')
    return NextResponse.json(
      { message: 'server error' },
      {
        status: HttpStatus.http500serverError,
      },
    ) as NextResponse<T>
  }
}
