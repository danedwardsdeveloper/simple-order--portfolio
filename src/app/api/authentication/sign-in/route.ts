import { authenticationMessages, basicMessages, cookieDurations, httpStatus } from '@/library/constants'
import { database } from '@/library/database/connection'
import { users } from '@/library/database/schema'
import { emailRegex } from '@/library/email/utilities'
import logger from '@/library/logger'
import { sanitiseDangerousBaseUser } from '@/library/utilities'
import { createCookieWithToken, createSessionCookieWithToken } from '@/library/utilities/server'
import type { AuthenticationMessages, DangerousBaseUser } from '@/types'
import type { SignInPOSTbody, SignInPOSTresponse } from '@/types/api/authentication/sign-in'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest): Promise<NextResponse<SignInPOSTresponse>> {
	const { email, password, staySignedIn }: SignInPOSTbody = await request.json()

	let missingFieldMessage: AuthenticationMessages | null = null
	if (!email) missingFieldMessage = authenticationMessages.emailMissing
	if (!password) missingFieldMessage = authenticationMessages.passwordMissing

	if (missingFieldMessage) {
		return NextResponse.json({ message: missingFieldMessage }, { status: httpStatus.http400badRequest })
	}

	const normalisedEmail = email.toLowerCase().trim()
	if (!emailRegex.test(normalisedEmail)) {
		return NextResponse.json({ message: authenticationMessages.emailInvalid }, { status: httpStatus.http400badRequest })
	}

	const [foundUser]: DangerousBaseUser[] = await database.select().from(users).where(eq(users.email, email)).limit(1)

	logger.debug('Found user: ', foundUser)

	if (!foundUser) {
		logger.debug(`User with email ${email} not found`)
		return NextResponse.json({ message: authenticationMessages.userNotFound }, { status: httpStatus.http404notFound })
	}

	const isMatch = await bcrypt.compare(password, foundUser.hashedPassword)

	if (!isMatch) {
		logger.debug(`Passwords didn't match`)
		return NextResponse.json({ message: authenticationMessages.invalidCredentials }, { status: httpStatus.http401unauthorised })
	}

	const baseBrowserSafeUser = sanitiseDangerousBaseUser(foundUser)

	const cookieStore = await cookies()
	if (staySignedIn) {
		cookieStore.set(createCookieWithToken(foundUser.id, cookieDurations.oneYear))
	} else {
		cookieStore.set(createSessionCookieWithToken(foundUser.id))
	}

	// ToDo: Somehow get the full user info. Maybe recycle verify-token
	return NextResponse.json({ message: basicMessages.success, baseBrowserSafeUser }, { status: httpStatus.http200ok })
}
