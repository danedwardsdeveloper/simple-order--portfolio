import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { database } from '@/library/database/configuration'
import { confirmationTokens, users } from '@/library/database/schema'
import { logUnknownErrorWithLabel } from '@/library/logger'

import {
  authenticationMessages,
  AuthenticationMessages,
  BasicMessages,
  basicMessages,
  httpStatus,
} from '@/types'

export interface ConfirmEmailPOSTresponse {
  message: BasicMessages | AuthenticationMessages
}

export interface ConfirmEmailPOSTbody {
  token: string
}

export async function POST(request: NextRequest): Promise<NextResponse<ConfirmEmailPOSTresponse>> {
  const { token }: ConfirmEmailPOSTbody = await request.json()

  if (!token) {
    return NextResponse.json(
      { message: authenticationMessages.tokenMissing },
      { status: httpStatus.http401unauthorised },
    )
  }

  try {
    const result = await database.transaction(async tx => {
      const [confirmationToken] = await tx
        .select()
        .from(confirmationTokens)
        .where(eq(confirmationTokens.token, token))
        .limit(1)

      if (!confirmationToken) {
        throw new Error(authenticationMessages.tokenInvalid)
      }

      if (new Date() > new Date(confirmationToken.expiresAt)) {
        throw new Error(authenticationMessages.tokenExpired)
      }

      if (confirmationToken.usedAt) {
        throw new Error(authenticationMessages.tokenUsed)
      }

      const [user] = await tx.select().from(users).where(eq(users.id, confirmationToken.userId)).limit(1)

      if (!user) {
        throw new Error(authenticationMessages.userNotFound)
      }

      await tx.update(users).set({ emailConfirmed: true }).where(eq(users.id, user.id))

      await tx
        .update(confirmationTokens)
        .set({ usedAt: new Date() })
        .where(eq(confirmationTokens.id, confirmationToken.id))

      return true
    })

    if (!result) {
      throw new Error()
    }

    return NextResponse.json({ message: basicMessages.success }, { status: httpStatus.http200ok })
  } catch (error) {
    logUnknownErrorWithLabel('Transaction failed: ', error)
    return NextResponse.json(
      { message: basicMessages.serverError },
      { status: httpStatus.http500serverError },
    )
  }
}
