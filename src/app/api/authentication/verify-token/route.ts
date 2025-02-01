import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { database } from '@/library/database/configuration'
import { users } from '@/library/database/schema'
import { logUnknownErrorWithLabel } from '@/library/logger'
import { extractIdFromRequestCookie } from '@/library/utilities'

import {
  authenticationMessages,
  AuthenticationMessages,
  BasicMessages,
  basicMessages,
  ClientSafeUser,
  httpStatus,
} from '@/types'

export interface VerifyTokenGETresponse {
  message: BasicMessages | AuthenticationMessages
  user?: ClientSafeUser
}

export async function GET(request: NextRequest): Promise<NextResponse<VerifyTokenGETresponse>> {
  try {
    const { extractedUserId, status, message } = extractIdFromRequestCookie(request)

    if (!extractedUserId) {
      return NextResponse.json({ message }, { status })
    }

    const user = database.select().from(users).where(eq(users.id, extractedUserId)).get()

    if (!user) {
      return NextResponse.json(
        { message: authenticationMessages.userNotFound },
        { status: httpStatus.http401unauthorised },
      )
    }

    // Transform user
    // Add merchant details, get orders etc.

    return NextResponse.json({ message: basicMessages.success, user }, { status: httpStatus.http200ok })
  } catch (error) {
    logUnknownErrorWithLabel('Unknown authorisation error: ', error)
    return NextResponse.json(
      { message: basicMessages.serverError },
      { status: httpStatus.http500serverError },
    )
  }
}
