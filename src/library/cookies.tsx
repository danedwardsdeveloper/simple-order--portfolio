import jwt from 'jsonwebtoken'

import { jwtSecret } from './environment/serverVariables'

import { isProduction } from './environment/publicVariables'

export const cookieNames = {
  token: 'token',
} as const

export type CookieNames = (typeof cookieNames)[keyof typeof cookieNames]

export const cookieDurations = {
  zero: 0,
  twoHours: 2 * 60 * 60,
  oneYear: 365 * 24 * 60 * 60,
} as const

export type CookieDurations = (typeof cookieDurations)[keyof typeof cookieDurations]

type BaseCookieOptions = {
  name: CookieNames
  httpOnly: true
  secure: boolean
  sameSite: 'strict'
  path: string
}

const baseCookieOptions: BaseCookieOptions = {
  name: cookieNames.token,
  httpOnly: true,
  secure: isProduction,
  sameSite: 'strict',
  path: '/',
} as const

type CookieOptions = BaseCookieOptions & {
  value: string
  maxAge?: CookieDurations
}

export function createCookieOptions(tokenValue: string, duration: CookieDurations): CookieOptions {
  return {
    name: cookieNames.token,
    value: tokenValue,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
    maxAge: duration,
  }
}

export function createSessionCookieOptions(tokenValue: string): CookieOptions {
  return {
    name: cookieNames.token,
    value: tokenValue,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
  }
}

export interface TokenPayload {
  sub: number
  exp: number
}

function generateTokenPayload(userId: number, duration: CookieDurations): TokenPayload {
  return {
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + duration,
  }
}

export function createCookieWithToken(userId: number, duration: CookieDurations): CookieOptions {
  const payload = generateTokenPayload(userId, duration)
  const token = jwt.sign(payload, jwtSecret)

  return {
    ...baseCookieOptions,
    value: token,
    maxAge: duration,
  }
}

export function createSessionCookieWithToken(userId: number): CookieOptions {
  const payload = generateTokenPayload(userId, cookieDurations.twoHours)
  const token = jwt.sign(payload, jwtSecret)

  return {
    ...baseCookieOptions,
    value: token,
  }
}

export function createDeleteCookie(): CookieOptions {
  return {
    ...baseCookieOptions,
    value: '',
    maxAge: cookieDurations.zero,
  }
}

// Usage
// response.cookies.set(createCookieWithToken(user.id, cookieDurations.oneYear))
// response.cookies.set(createSessionCookieWithToken(user.id))
// response.cookies.set(createDeleteCookie())
