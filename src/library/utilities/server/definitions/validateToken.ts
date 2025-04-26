import { cookieNames } from '@/library/constants'
import { jwtSecret } from '@/library/environment/serverVariables'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

type JwtPayload = jwt.JwtPayload

type Output = Promise<
	| { tokenInvalid: { message: string }; extractedUserId?: never } //
	| { tokenInvalid?: never; extractedUserId: number }
>

export async function validateToken(_request: NextRequest): Output {
	try {
		const cookieStore = await cookies()
		const accessToken = cookieStore.get(cookieNames.token)

		if (!accessToken) {
			return { tokenInvalid: { message: 'token missing' } }
		}

		const { sub } = jwt.verify(accessToken.value, jwtSecret) as JwtPayload

		if (!sub) {
			return { tokenInvalid: { message: 'invalid token' } }
		}

		const extractedUserId = Number(sub)
		if (Number.isNaN(extractedUserId)) {
			return { tokenInvalid: { message: 'invalid token' } }
		}

		return { extractedUserId }
	} catch {
		return { tokenInvalid: { message: 'invalid token' } }
	}
}
