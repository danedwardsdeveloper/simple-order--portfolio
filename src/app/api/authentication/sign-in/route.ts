import {
	apiPaths,
	authenticationMessages,
	basicMessages,
	cookieDurations,
	httpStatus,
	missingFieldMessages,
	tokenMessages,
} from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkActiveSubscriptionOrTrial, getUserRoles } from '@/library/database/operations'
import { users } from '@/library/database/schema'
import { emailRegex } from '@/library/email/utilities'
import logger from '@/library/logger'
import { sanitiseDangerousBaseUser } from '@/library/utilities'
import { createCookieWithToken } from '@/library/utilities/server'
import type { BrowserSafeCompositeUser, DangerousBaseUser, MissingFieldMessages } from '@/types'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

export interface SignInPOSTbody {
	password: string
	email: string
}

export interface SignInPOSTresponse {
	message:
		| typeof basicMessages.success
		| typeof missingFieldMessages.emailMissing
		| typeof missingFieldMessages.passwordMissing
		| typeof authenticationMessages.invalidEmailFormat
		| typeof tokenMessages.userNotFound
		| typeof authenticationMessages.invalidCredentials
	user?: BrowserSafeCompositeUser
}

const routeDetail = `POST ${apiPaths.authentication.signIn}:`

export async function POST(request: NextRequest): Promise<NextResponse<SignInPOSTresponse>> {
	const { email, password }: SignInPOSTbody = await request.json()

	let missingFieldMessage: MissingFieldMessages | undefined = undefined
	if (!email) missingFieldMessage = missingFieldMessages.emailMissing
	if (!password) missingFieldMessage = missingFieldMessages.passwordMissing

	if (missingFieldMessage) {
		logger.warn(routeDetail, missingFieldMessage)
		return NextResponse.json({ message: missingFieldMessage }, { status: httpStatus.http400badRequest })
	}

	const normalisedEmail = email.toLowerCase().trim()
	if (!emailRegex.test(normalisedEmail)) {
		logger.warn(routeDetail, authenticationMessages.invalidEmailFormat)
		return NextResponse.json({ message: authenticationMessages.invalidEmailFormat }, { status: httpStatus.http400badRequest })
	}

	const [dangerousUser]: DangerousBaseUser[] = await database.select().from(users).where(eq(users.email, email)).limit(1)

	if (!dangerousUser) {
		logger.warn(routeDetail, tokenMessages.userNotFound)
		logger.debug(`User with email ${email} not found`)
		return NextResponse.json({ message: tokenMessages.userNotFound }, { status: httpStatus.http404notFound })
	}

	const isMatch = await bcrypt.compare(password, dangerousUser.hashedPassword)

	if (!isMatch) {
		logger.warn(routeDetail, 'incorrect password')
		return NextResponse.json({ message: authenticationMessages.invalidCredentials }, { status: httpStatus.http401unauthorised })
	}

	const cookieStore = await cookies()
	cookieStore.set(createCookieWithToken(dangerousUser.id, cookieDurations.oneYear))

	const { userRole } = await getUserRoles(dangerousUser)

	const { activeSubscriptionOrTrial } = await checkActiveSubscriptionOrTrial(dangerousUser.id)

	const sanitisedBaseUser = sanitiseDangerousBaseUser(dangerousUser)

	const user: BrowserSafeCompositeUser = {
		...sanitisedBaseUser,
		roles: userRole,
		activeSubscriptionOrTrial,
	}

	logger.info(routeDetail, 'Signed in successfully')
	return NextResponse.json({ message: basicMessages.success, user }, { status: httpStatus.http200ok })
}
