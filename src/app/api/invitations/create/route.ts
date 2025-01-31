import { NextRequest, NextResponse } from 'next/server'

import { database } from '@/library/database/configuration'
import { logUnknownErrorWithLabel } from '@/library/logger'
import { checkAuthorisation, extractIdFromRequestCookie } from '@/library/utilities'

import {
  authenticationMessages,
  AuthenticationMessages,
  BasicMessages,
  basicMessages,
  httpStatus,
} from '@/types'

export interface InvitationsCreatePOSTresponse {
  message: BasicMessages | AuthenticationMessages
}

export interface InvitationsCreatePOSTbody {
  email: string
}

export async function POST(request: NextRequest): Promise<NextResponse<InvitationsCreatePOSTresponse>> {
  const { email }: InvitationsCreatePOSTbody = await request.json()

  if (!email) {
    return NextResponse.json(
      { message: authenticationMessages.emailMissing },
      { status: httpStatus.http400badRequest },
    )
  }

  try {
    const { extractedUserId, status, message } = extractIdFromRequestCookie(request)

    if (!extractedUserId) {
      return NextResponse.json({ message }, { status })
    }

    const result = await database.transaction(async tx => {
      const { userExists, emailConfirmed } = checkAuthorisation(tx, extractedUserId)
      return { userExists, emailConfirmed }

      /* 
        - 
      */
    })

    if (!result) {
      throw new Error()
    }

    return NextResponse.json({ message: basicMessages.success }, { status })
  } catch (error) {
    logUnknownErrorWithLabel('Failed to create invitation: ', error)
    return NextResponse.json(
      { message: basicMessages.serverError },
      { status: httpStatus.http500serverError },
    )
  }
}
