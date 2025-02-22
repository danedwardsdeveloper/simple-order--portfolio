import { apiPaths, authenticationMessages, basicMessages, cookieDurations, httpStatus } from '@/library/constants'
import { database } from '@/library/database/connection'
import { products, users } from '@/library/database/schema'
import { emailRegex } from '@/library/email/utilities'
import logger from '@/library/logger'
import { sanitiseDangerousBaseUser } from '@/library/utilities'
import { createCookieWithToken, createSessionCookieWithToken } from '@/library/utilities/server'
import type { AuthenticationMessages, BrowserSafeProduct, DangerousBaseUser, FullBrowserSafeUser } from '@/types'
import type { SignInPOSTbody, SignInPOSTresponse } from '@/types/api/authentication/sign-in'
import bcrypt from 'bcryptjs'
import { and, eq, isNull } from 'drizzle-orm'
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

	if (!foundUser) {
		logger.debug(`User with email ${email} not found`)
		return NextResponse.json({ message: authenticationMessages.userNotFound }, { status: httpStatus.http404notFound })
	}

	logger.info('Found user: ', foundUser)

	const isMatch = await bcrypt.compare(password, foundUser.hashedPassword)

	if (!isMatch) {
		logger.debug(`Passwords didn't match`)
		return NextResponse.json({ message: authenticationMessages.invalidCredentials }, { status: httpStatus.http401unauthorised })
	}

	const baseBrowserSafeUser = sanitiseDangerousBaseUser(foundUser)

	const inventory: BrowserSafeProduct[] = await database
		.select()
		.from(products)
		.where(and(eq(products.ownerId, foundUser.id), isNull(products.deletedAt)))

	if (!inventory) {
		logger.error(`${apiPaths.authentication.signIn} inventory not found`)
	}

	const fullBrowserSafeUser: FullBrowserSafeUser = {
		...baseBrowserSafeUser,
		inventory,
	}

	logger.debug('Full browser-safe user: ', fullBrowserSafeUser)

	const cookieStore = await cookies()
	if (staySignedIn) {
		cookieStore.set(createCookieWithToken(foundUser.id, cookieDurations.oneYear))
	} else {
		cookieStore.set(createSessionCookieWithToken(foundUser.id))
	}

	// ToDo: Somehow get the full user info. Maybe recycle verify-token
	return NextResponse.json({ message: basicMessages.success, fullBrowserSafeUser }, { status: httpStatus.http200ok })
}
