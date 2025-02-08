import { NextRequest, NextResponse } from 'next/server'
import { validate as validateConfirmationTokenFormat } from 'uuid'

import logger from '@/library/logger'

import { AuthenticationMessages, BasicMessages, basicMessages, httpStatus, NewBaseUser } from '@/types'

export interface InvitationsAcceptPOSTbody extends Omit<NewBaseUser, 'emailConfirmed'> {
  staySignedIn: boolean
}

export interface InvitationsAcceptPOSTresponse {
  message: BasicMessages | AuthenticationMessages
}

export async function POST(request: NextRequest): Promise<NextResponse<InvitationsAcceptPOSTresponse>> {
  const { firstName, lastName, email, businessName, hashedPassword, staySignedIn }: InvitationsAcceptPOSTbody = await request.json()

  const newUser: NewBaseUser = {
    firstName: '',
    lastName: '',
    email: '',
    businessName: '',
    hashedPassword: '',
    emailConfirmed: true,
    cachedTrialExpired: false,
  }

  try {
    return NextResponse.json({ message: basicMessages.success }, { status: httpStatus.http201created })
  } catch (error) {
    logger.errorUnknown(error)
    return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
  }
}
