import { NextRequest, NextResponse } from 'next/server'

import protectedRoute from '@/library/authorisation/protectedRoute'

export async function GET(request: NextRequest): Promise<NextResponse> {
  return protectedRoute(request, 'allow unconfirmed', async () => {
    return NextResponse.json({
      message: 'Congratulations on accessing this top-secret route!',
    })
  })
}
