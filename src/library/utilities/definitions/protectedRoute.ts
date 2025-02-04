// @ts-nocheck
import jwt, { JwtPayload } from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

import { User } from '../database/schema'
import { jwtSecret } from '../environment/serverVariables'
import logger from '../logger'
import { findUserById } from '../temporaryData/temporaryUsers'
import { AuthenticationMessages, BasicMessages, httpStatus } from '@/types'

export default async function protectedRoute<T extends { message: BasicMessages | AuthenticationMessages | string }>(
  request: NextRequest,
  confirmationRequired: 'require confirmation' | 'allow unconfirmed',
  handler: (authenticatedSafeUser: User, authenticatedRequest: NextRequest) => Promise<NextResponse<T>>,
): Promise<NextResponse<T>> {
  try {
    if (!accessToken) {
      logger.info('Access token not found')
      return NextResponse.json(
        { message: 'token missing' },
        {
          status: httpStatus.http401unauthorised,
        },
      ) as NextResponse<T>
    }

    let decoded: JwtPayload
    try {
      const result: JwtPayload = jwt.verify(accessToken, jwtSecret)
      decoded = {
        sub: Number(result.sub),
      }
    } catch (error) {
      logger.info('JWT verification failed:', error)
      const message = error instanceof jwt.TokenExpiredError ? 'expired token' : 'invalid token'
      return NextResponse.json({ message }, { status: httpStatus.http401unauthorised }) as NextResponse<T>
    }

    const existingUser = findUserById(decoded.sub)

    if (!existingUser) {
      logger.info(`User with id: ${decoded.sub} not found in database`)
      return NextResponse.json(
        { message: 'user not found' },
        {
          status: httpStatus.http404notFound,
        },
      ) as NextResponse<T>
    }

    if (confirmationRequired === 'require confirmation' && !existingUser.emailConfirmed) {
      logger.info(`User ${existingUser.id} attempted to access route without confirmation`)
      return NextResponse.json(
        { message: 'email not confirmed' },
        {
          status: httpStatus.http403forbidden,
        },
      ) as NextResponse<T>
    }

    return handler(existingUser, request)
  } catch (error) {
    logger.error('Error in protected route:', error instanceof Error ? error.message : 'Unknown server error')
    return NextResponse.json(
      { message: 'server error' },
      {
        status: httpStatus.http500serverError,
      },
    ) as NextResponse<T>
  }
}
