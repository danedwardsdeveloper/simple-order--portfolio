import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

import { cookieDurations, createCookieWithToken, createSessionCookieWithToken } from '@/library/cookies'
import { createSafeUser, findUserByEmail } from '@/library/tempData/users'

import { authorisationMessages, basicMessages, HttpStatus, SignInPOSTbody, SignInPOSTresponse } from '@/types'

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

  const foundUser = findUserByEmail(email)

  if (!foundUser) {
    return NextResponse.json(
      {
        message: authorisationMessages.userNotFound,
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
        message: authorisationMessages.invalidCredentials,
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
