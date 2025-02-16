import bcrypt from 'bcryptjs'
import { eq as equals } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

import { database } from '@/library/database/connection'
import { users } from '@/library/database/schema'
import { createCookieWithToken, createSessionCookieWithToken } from '@/library/utilities/server'

import { cookieDurations } from '@/library/constants/cookies'
import { type AuthenticationMessages, type DangerousBaseUser, authenticationMessages, basicMessages, httpStatus } from '@/types'
import type { SignInPOSTbody, SignInPOSTresponse } from '@/types/api/authentication/sign-in'

export async function POST(request: NextRequest): Promise<NextResponse<SignInPOSTresponse>> {
	const { email, password, staySignedIn }: SignInPOSTbody = await request.json()

	let missingFieldMessage: AuthenticationMessages | null = null
	if (!email) missingFieldMessage = authenticationMessages.emailMissing
	if (!password) missingFieldMessage = authenticationMessages.passwordMissing

	if (missingFieldMessage) {
		return NextResponse.json(
			{
				message: missingFieldMessage,
			},
			{
				status: httpStatus.http400badRequest,
			},
		)
	}

	// ToDo! Create safe found user function. Really important!
	const [foundUser]: DangerousBaseUser[] = await database.select().from(users).where(equals(users.email, email)).limit(1)

	if (!foundUser) {
		return NextResponse.json({ message: authenticationMessages.userNotFound }, { status: httpStatus.http404notFound })
	}

	const isMatch = await bcrypt.compare(password, foundUser.hashedPassword)

	if (!isMatch) {
		return NextResponse.json({ message: authenticationMessages.invalidCredentials }, { status: httpStatus.http401unauthorised })
	}

	const cookieStore = await cookies()
	if (staySignedIn) {
		cookieStore.set(createCookieWithToken(foundUser.id, cookieDurations.oneYear))
	} else {
		cookieStore.set(createSessionCookieWithToken(foundUser.id))
	}

	return NextResponse.json({ message: basicMessages.success, foundUser }, { status: httpStatus.http200ok })
}
