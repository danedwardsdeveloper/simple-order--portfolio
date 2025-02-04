import { eq as equals } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { database } from '@/library/database/configuration'
import { users } from '@/library/database/schema'
import logger from '@/library/logger'
import { extractIdFromRequestCookie } from '@/library/utilities/server'

import { authenticationMessages, AuthenticationMessages, BasicMessages, basicMessages, ClientSafeUser, httpStatus } from '@/types'

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

    const [user] = await database.select().from(users).where(equals(users.id, extractedUserId))

    if (!user) {
      return NextResponse.json({ message: authenticationMessages.userNotFound }, { status: httpStatus.http401unauthorised })
    }

    // Add merchant details, get orders etc. and transform user

    return NextResponse.json({ message: basicMessages.success, user }, { status: httpStatus.http200ok })
  } catch (error) {
    logger.errorUnknown(error, 'Unknown authorisation error: ')
    return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
  }
}
