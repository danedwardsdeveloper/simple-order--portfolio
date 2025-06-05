import { cookieDurations, userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { getUserData } from '@/library/database/operations'
import { users } from '@/library/database/schema'
import { formatFirstError } from '@/library/utilities/public'
import { createCookieWithToken, equals, initialiseResponderNew } from '@/library/utilities/server'
import { SignInSchema } from '@/library/validations'
import type { ApiResponse, DangerousBaseUser, UserData } from '@/types'
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

type Success = {
	ok: true
	userData: UserData
}

type Failure = {
	ok: false
	userMessage?: string // ToDo - make strict
	developmentMessage?: string
}

export type SignInPOSTresponse = ApiResponse<Success, Failure>

type Output = Promise<NextResponse<SignInPOSTresponse>>

export async function POST(request: NextRequest): Output {
	const respond = initialiseResponderNew<Success, Failure>()

	let body: SignInPOSTresponse | undefined
	try {
		body = await request.json()
	} catch {
		return respond({
			body: {},
			status: 400,
			developmentMessage: 'Missing request body',
		})
	}

	try {
		const { success, error, data } = SignInSchema.safeParse(body)

		if (!success) {
			return respond({
				body: {},
				status: 400,
				developmentMessage: formatFirstError(error),
			})
		}

		const { email, password } = data

		const [dangerousUser]: DangerousBaseUser[] = await database.select().from(users).where(equals(users.email, email)).limit(1)

		if (!dangerousUser) {
			return respond({
				body: { userMessage: 'User with email ${email} not found' }, // ToDo: use template literal!
				status: 404,
				developmentMessage: `User with email ${email} not found`,
			})
		}

		const passwordsMatch = await bcrypt.compare(password, dangerousUser.hashedPassword)

		if (!passwordsMatch) {
			return respond({
				body: { userMessage: 'Invalid credentials' }, // ToDo!!!
				status: 401,
				developmentMessage: 'Incorrect password',
			})
		}

		const userData = await getUserData(dangerousUser)

		const cookieStore = await cookies()
		cookieStore.set(createCookieWithToken(dangerousUser.id, cookieDurations.oneYear))

		return respond({
			body: { userData },
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
