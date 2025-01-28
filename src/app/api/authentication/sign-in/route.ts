import bcrypt from 'bcryptjs'
import { eq as equals } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { database } from '@/library/database/configuration'
import { users } from '@/library/database/schema'
import {
  createCookieWithToken,
  createSessionCookieWithToken,
} from '@/library/utilities/definitions/createCookies'
import { createSafeUser } from '@/library/utilities/definitions/createSafeUser'

import {
  authenticationMessages,
  basicMessages,
  cookieDurations,
  HttpStatus,
  SignInPOSTbody,
  SignInPOSTresponse,
} from '@/types'

export async function POST(request: NextRequest): Promise<NextResponse<SignInPOSTresponse>> {
  const { email, password, staySignedIn }: SignInPOSTbody = await request.json()

  if (!email || !password) {
    return NextResponse.json(
      {
        message: basicMessages.parametersMissing,
      },
      {
        status: HttpStatus.http400badRequest,
      },
    )
  }

  const foundUser = database.select().from(users).where(equals(users.email, email)).get()

  if (!foundUser) {
    return NextResponse.json(
      {
        message: authenticationMessages.userNotFound,
      },
      {
        status: HttpStatus.http404notFound,
      },
    )
  }

  const isMatch = await bcrypt.compare(password, foundUser.hashedPassword)

  if (!isMatch) {
    return NextResponse.json(
      {
        message: authenticationMessages.invalidCredentials,
      },
      {
        status: HttpStatus.http401unauthorised,
      },
    )
  }

  const response = NextResponse.json(
    {
      message: basicMessages.success,
      foundUser: createSafeUser(foundUser),
    },
    {
      status: HttpStatus.http200ok,
    },
  )

  if (staySignedIn) {
    response.cookies.set(createCookieWithToken(foundUser.id, cookieDurations.oneYear))
  } else {
    response.cookies.set(createSessionCookieWithToken(foundUser.id))
  }

  return response
}
