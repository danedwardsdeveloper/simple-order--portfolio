import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

import { findUserByEmail } from '@/library/tempData/users'

import { authorisationMessages, basicMessages, HttpStatus, SignInPOSTbody, SignInPOSTresponse } from '@/types'

export async function POST(
  request: NextRequest,
  response: NextResponse,
): Promise<NextResponse<SignInPOSTresponse>> {
  const { email, password }: SignInPOSTbody = await request.json()

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

  return NextResponse.json(
    {
      message: basicMessages.success,
      foundUser,
    },
    {
      status: HttpStatus.http200ok,
    },
  )
}
