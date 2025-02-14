import { NextRequest, NextResponse } from 'next/server'

import { database } from '@/library/database/configuration'
import { checkAuthorisation, extractIdFromRequestCookie } from '@/library/utilities'

import { basicMessages, httpStatus } from '@/types'

export async function GET(request: NextRequest): Promise<NextResponse> {
try {
const { extractedUserId, status, message } = extractIdFromRequestCookie(request)

    if (!extractedUserId) {
      return NextResponse.json({ message }, { status })
    }

    const { userExists, emailConfirmed } = await database.transaction(async tx => {
      const { userExists, emailConfirmed } = checkAuthorisation(tx, extractedUserId)
      return { userExists, emailConfirmed }
    })

    return NextResponse.json({ message: basicMessages.success, userExists, emailConfirmed }, { status })

} catch (error) {
return NextResponse.json(
{ message: error instanceof Error ? error.message : 'Transaction failed' },
{ status: httpStatus.http500serverError },
)
}
}
