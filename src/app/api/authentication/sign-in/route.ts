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
  httpStatus,
  SignInPOSTbody,
  SignInPOSTresponse,
} from '@/types'

export async function POST(request: NextRequest): Promise<NextResponse<SignInPOSTresponse>> {
  const { email, password, staySignedIn }: SignInPOSTbody = await request.json()

  let missingFieldMessage
  if (!email) missingFieldMessage = authenticationMessages.emailMissing
  if (!password) missingFieldMessage = authenticationMessages.passwordMissing

  if (missingFieldMessage) {
    return NextResponse.json(
      {
        message: missingFieldMessage,
      },
      {
        status: httpStatus.http400badRequest,
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
        status: httpStatus.http404notFound,
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
        status: httpStatus.http401unauthorised,
      },
    )
  }

  const response = NextResponse.json(
    {
      message: basicMessages.success,
      foundUser: createSafeUser(foundUser),
    },
    {
      status: httpStatus.http200ok,
    },
  )

  if (staySignedIn) {
    response.cookies.set(createCookieWithToken(foundUser.id, cookieDurations.oneYear))
  } else {
    response.cookies.set(createSessionCookieWithToken(foundUser.id))
  }

  return response
}
