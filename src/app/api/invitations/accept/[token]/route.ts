import { NextRequest, NextResponse } from 'next/server'
import { validate } from 'uuid'

import logger from '@/library/logger'

import { authenticationMessages, AuthenticationMessages, BasicMessages, basicMessages, httpStatus } from '@/types'

export interface InvitationsAcceptPOSTresponse {
  message: BasicMessages | AuthenticationMessages | string // ToDo: make strict
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
): Promise<NextResponse<InvitationsAcceptPOSTresponse>> {
  try {
    const token = (await params).token

    if (!token) {
      return NextResponse.json({ message: authenticationMessages.tokenMissing }, { status: httpStatus.http400badRequest })
    }

    if (!validate(token)) {
      return NextResponse.json({ message: authenticationMessages.tokenInvalid }, { status: httpStatus.http400badRequest })
    }

    return NextResponse.json({ message: basicMessages.success }, { status: httpStatus.http201created })
  } catch (error) {
    logger.errorUnknown(error)
    return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
  }
}

/*
export interface InvitationsAcceptPOSTbody extends Omit<NewBaseUser, 'emailConfirmed'> {
staySignedIn: boolean

const { firstName, lastName, email, businessName, hashedPassword, staySignedIn }: InvitationsAcceptPOSTbody = await request.json()
*/
