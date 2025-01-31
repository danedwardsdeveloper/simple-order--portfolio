import { NextResponse } from 'next/server'

import { basicMessages, BasicMessages, cookieNames, httpStatus } from '@/types'

export interface SignOutPOSTresponse {
  message: BasicMessages | 'error deleting cookie'
}

export async function POST(): Promise<NextResponse<SignOutPOSTresponse>> {
  const response = NextResponse.json(
    { message: basicMessages.success },
    {
      status: httpStatus.http200ok,
    },
  )

  response.cookies.delete(cookieNames.token)

  const verifyDeletion = response.cookies.get(cookieNames.token)

  if (verifyDeletion && verifyDeletion.value) {
    return NextResponse.json({ message: 'error deleting cookie' }, { status: httpStatus.http500serverError })
  }

  return response
}
