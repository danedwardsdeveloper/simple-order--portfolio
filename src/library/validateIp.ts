import { NextRequest, NextResponse } from 'next/server'

const ALLOW_LOCALHOST = true

interface ValidateIpOptions {
  allowLocalhost?: boolean
  customMessage?: string
}

interface ValidationResult {
  isValid: boolean
  response?: NextResponse
}

export function validateRequestIp(request: NextRequest, options: ValidateIpOptions = {}): ValidationResult {
  const { allowLocalhost = ALLOW_LOCALHOST, customMessage = 'Ignored localhost attempt' } = options

  const ip =
    request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0'

  if (!allowLocalhost && (ip === '::1' || ip === '127.0.0.1')) {
    return {
      isValid: false,
      response: NextResponse.json({ message: customMessage }),
    }
  }

  return { isValid: true }
}
