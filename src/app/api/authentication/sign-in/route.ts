import { apiPaths, cookieDurations, userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkActiveSubscriptionOrTrial, getUserRoles } from '@/library/database/operations'
import { users } from '@/library/database/schema'
import { initialiseDevelopmentLogger, sanitiseDangerousBaseUser } from '@/library/utilities/public'
import { createCookieWithToken } from '@/library/utilities/server'
import { equals } from '@/library/utilities/server'
import { SignInSchema } from '@/library/validations'
import type { BrowserSafeCompositeUser, DangerousBaseUser, UserMessages } from '@/types'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'
import type z from 'zod'

export type SignInPOSTbody = z.infer<typeof SignInSchema>

export interface SignInPOSTresponse {
	userMessage?: UserMessages
	developmentMessage?: string
	user?: BrowserSafeCompositeUser
}

export async function POST(request: NextRequest): Promise<NextResponse<SignInPOSTresponse>> {
	const routeSignature = `POST ${apiPaths.authentication.signIn}:`
	const developmentLogger = initialiseDevelopmentLogger(routeSignature)

	try {
		const body = await request.json().catch(() => ({}))
		const result = SignInSchema.safeParse(body)

		if (!result.success) {
			const firstError = result.error.errors[0]
			const fieldPath = firstError.path.join('.')
			const errorMessage = fieldPath ? `${fieldPath}: ${firstError.message}` : firstError.message
			const developmentMessage = developmentLogger(errorMessage)
			return NextResponse.json({ developmentMessage }, { status: 400 })
		}

		const { email, password } = result.data

		const [dangerousUser]: DangerousBaseUser[] = await database.select().from(users).where(equals(users.email, email)).limit(1)

		if (!dangerousUser) {
			const developmentMessage = developmentLogger(`User with email ${email} not found`)
			return NextResponse.json({ developmentMessage }, { status: 404 })
		}

		const isMatch = await bcrypt.compare(password, dangerousUser.hashedPassword)

		if (!isMatch) {
			const developmentMessage = developmentLogger('Incorrect password')
			return NextResponse.json({ developmentMessage }, { status: 401 })
		}

		const cookieStore = await cookies()
		cookieStore.set(createCookieWithToken(dangerousUser.id, cookieDurations.oneYear))

		const { userRole } = await getUserRoles(dangerousUser)

		const { activeSubscriptionOrTrial } = await checkActiveSubscriptionOrTrial(dangerousUser.id, dangerousUser.cachedTrialExpired)

		const sanitisedBaseUser = sanitiseDangerousBaseUser(dangerousUser)

		const user: BrowserSafeCompositeUser = {
			...sanitisedBaseUser,
			roles: userRole,
			activeSubscriptionOrTrial,
		}

		const developmentMessage = developmentLogger('Signed in successfully', { level: 'level3success' })
		return NextResponse.json({ user, developmentMessage }, { status: 200 })
	} catch (error) {
		const developmentMessage = developmentLogger('Caught error', { error })
		return NextResponse.json({ userMessage: userMessages.serverError, developmentMessage }, { status: 500 })
	}
}
