import { cookieDurations, userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkActiveSubscriptionOrTrial, getUserRoles } from '@/library/database/operations'
import { confirmationTokens, users } from '@/library/database/schema'
import { sanitiseDangerousBaseUser } from '@/library/utilities/public'
import { createCookieWithToken, initialiseResponder } from '@/library/utilities/server'
import { equals } from '@/library/utilities/server'
import type { BrowserSafeCompositeUser, ConfirmationToken, DangerousBaseUser } from '@/types'
import { cookies } from 'next/headers'
import type { NextRequest, NextResponse } from 'next/server'

export interface ConfirmEmailPOSTresponse {
	developmentMessage?: string
	userMessage?: typeof userMessages.emailAlreadyConfirmed | typeof userMessages.serverError
	confirmedUser?: BrowserSafeCompositeUser
}

export interface ConfirmEmailPOSTbody {
	token: string
}

type Output = Promise<NextResponse<ConfirmEmailPOSTresponse>>

// Optimisation ToDo: this is really inefficient
export async function POST(request: NextRequest): Output {
	const respond = initialiseResponder<ConfirmEmailPOSTresponse>()

	let transactionFailureMessage = undefined
	let transactionFailureStatus = undefined
	try {
		const { token }: ConfirmEmailPOSTbody = await request.json()

		if (!token) {
			return respond({
				status: 400,
				developmentMessage: 'Email confirmation token missing',
			})
		}

		const [foundToken]: ConfirmationToken[] = await database
			.select()
			.from(confirmationTokens)
			.where(equals(confirmationTokens.token, token))

		if (!foundToken) {
			return respond({
				status: 401,
				developmentMessage: 'Email confirmation token not found in database',
			})
		}

		const [foundDangerousUser]: DangerousBaseUser[] = await database.select().from(users).where(equals(users.id, foundToken.userId))

		if (!foundDangerousUser) {
			return respond({
				status: 404,
				developmentMessage: 'User not found',
			})
		}

		if (foundDangerousUser.emailConfirmed) {
			return respond({
				body: { userMessage: userMessages.emailAlreadyConfirmed },
				status: 202,
			})
		}

		const nowUTC = new Date()
		nowUTC.setUTCHours(0, 0, 0, 0)

		if (nowUTC > new Date(foundToken.expiresAt)) {
			return respond({
				status: 401,
				developmentMessage: 'Token expired',
			})
		}

		const { updatedUser } = await database.transaction(async (tx) => {
			transactionFailureMessage = 'transaction error updating user'
			transactionFailureStatus = 500
			const [updatedUser] = await tx.update(users).set({ emailConfirmed: true }).where(equals(users.id, foundDangerousUser.id)).returning()

			transactionFailureMessage = 'transaction error expiring token'
			await tx.update(confirmationTokens).set({ usedAt: new Date() }).where(equals(confirmationTokens.id, foundToken.id))

			transactionFailureMessage = undefined
			transactionFailureStatus = undefined
			return { updatedUser }
		})

		const { userRole } = await getUserRoles(foundDangerousUser)
		const { trialEnd, subscriptionEnd } = await checkActiveSubscriptionOrTrial(foundDangerousUser.id)

		const confirmedUser: BrowserSafeCompositeUser = {
			...sanitiseDangerousBaseUser(updatedUser),
			roles: userRole,
			subscriptionEnd,
			trialEnd,
		}

		const cookieStore = await cookies()
		cookieStore.set(createCookieWithToken(foundDangerousUser.id, cookieDurations.oneYear))

		return respond({
			body: { confirmedUser },
			status: 200,
		})
	} catch (caughtError) {
		if (transactionFailureStatus && transactionFailureMessage) {
			return respond({
				status: transactionFailureStatus || 500,
				caughtError,
				developmentMessage: transactionFailureMessage,
			})
		}

		return respond({
			body: { userMessage: userMessages.serverError },
			status: 500,
			caughtError,
		})
	}
}
