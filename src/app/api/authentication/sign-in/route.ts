import { cookieDurations, userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkActiveSubscriptionOrTrial, getUserRoles } from '@/library/database/operations'
import { users } from '@/library/database/schema'
import { sanitiseDangerousBaseUser } from '@/library/utilities/public'
import { createCookieWithToken, equals, formatFirstError, initialiseResponder } from '@/library/utilities/server'
import { SignInSchema } from '@/library/validations'
import type { BrowserSafeCompositeUser, DangerousBaseUser, UserMessages } from '@/types'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import type { NextRequest, NextResponse } from 'next/server'
import type z from 'zod'

/**
 * @example
const body: SignInPOSTbody = {
    email: 'beyonce@gmail.com',
    password: 'iLoveJZ'
}
 */
export type SignInPOSTbody = z.infer<typeof SignInSchema>

export interface SignInPOSTresponse {
	userMessage?: UserMessages
	developmentMessage?: string
	user?: BrowserSafeCompositeUser
}

type Output = Promise<NextResponse<SignInPOSTresponse>>

export async function POST(request: NextRequest): Output {
	const respond = initialiseResponder<SignInPOSTresponse>()

	let body: SignInPOSTresponse | undefined
	try {
		body = await request.json()
	} catch {
		return respond({
			status: 400, //
			developmentMessage: 'Missing request body',
		})
	}

	try {
		const { success, error, data } = SignInSchema.safeParse(body)

		if (!success) {
			return respond({
				status: 400,
				developmentMessage: formatFirstError(error),
			})
		}

		const { email, password } = data

		const [dangerousUser]: DangerousBaseUser[] = await database.select().from(users).where(equals(users.email, email)).limit(1)

		if (!dangerousUser) {
			return respond({
				status: 404,
				developmentMessage: `User with email ${email} not found`,
			})
		}

		const passwordsMatch = await bcrypt.compare(password, dangerousUser.hashedPassword)

		if (!passwordsMatch) {
			return respond({
				status: 401,
				developmentMessage: 'Incorrect password',
			})
		}

		const cookieStore = await cookies()
		cookieStore.set(
			createCookieWithToken(
				dangerousUser.id, //
				cookieDurations.oneYear,
			),
		)

		const { userRole } = await getUserRoles(dangerousUser)

		const { trialEnd, subscriptionEnd, subscriptionCancelled } = await checkActiveSubscriptionOrTrial(dangerousUser.id)

		const sanitisedBaseUser = sanitiseDangerousBaseUser(dangerousUser)

		const user: BrowserSafeCompositeUser = {
			...sanitisedBaseUser,
			roles: userRole,
			subscriptionEnd,
			trialEnd,
			subscriptionCancelled,
		}

		return respond({
			body: { user },
			status: 200,
			developmentMessage: 'Signed in successfully',
		})
	} catch (caughtError) {
		return respond({
			body: { userMessage: userMessages.serverError },
			status: 500,
			caughtError,
		})
	}
}
