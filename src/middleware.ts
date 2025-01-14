import { type NextRequest, NextResponse } from 'next/server'

import { bareCustomDomain, bareFlyDomain } from '@/library/environment/publicVariables'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''

  if (hostname === bareFlyDomain) {
    return NextResponse.redirect(
      `https://${bareCustomDomain}${request.nextUrl.pathname}${request.nextUrl.search}`,
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}
