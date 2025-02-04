import bcrypt from 'bcryptjs'
import { eq as equals } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { database } from '@/library/database/configuration'
import { users } from '@/library/database/schema'
import { createSafeUser } from '@/library/utilities/definitions/createSafeUser'
import { createCookieWithToken, createSessionCookieWithToken } from '@/library/utilities/server'

import { authenticationMessages, basicMessages, cookieDurations, httpStatus } from '@/types'
import { SignInPOSTbody, SignInPOSTresponse } from '@/types/api/authentication/sign-in'

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

  const [foundUser] = await database.select().from(users).where(equals(users.email, email)).limit(1)

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
