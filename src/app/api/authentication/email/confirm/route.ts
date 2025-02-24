import { authenticationMessages, basicMessages, httpStatus, tokenMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { confirmationTokens, users } from '@/library/database/schema'
import logger from '@/library/logger'
import type { ConfirmationToken, DangerousBaseUser, EmailTokenMessages } from '@/types'
import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'

export interface ConfirmEmailPOSTresponse {
	message: typeof basicMessages.success | typeof basicMessages.serverError | EmailTokenMessages
}

export interface ConfirmEmailPOSTbody {
	token: string | null
}

export async function POST(request: NextRequest): Promise<NextResponse<ConfirmEmailPOSTresponse>> {
	const { token }: ConfirmEmailPOSTbody = await request.json()

	if (!token) {
		return NextResponse.json({ message: tokenMessages.tokenMissing }, { status: httpStatus.http401unauthorised })
	}

	// ToDo: remove unnecessary stages from this transaction and catch errors properly
	let transactionFailureMessage = null
	let transactionFailureStatus = null
	try {
		const result = await database.transaction(async (tx) => {
			const [confirmationToken]: ConfirmationToken[] = await tx
				.select()
				.from(confirmationTokens)
				.where(eq(confirmationTokens.token, token))
				.limit(1)

			if (!confirmationToken) {
				transactionFailureMessage = tokenMessages.tokenInvalid
				transactionFailureStatus = httpStatus.http401unauthorised
				throw new Error()
			}

			if (confirmationToken.usedAt) {
				const [user]: DangerousBaseUser[] = await tx.select().from(users).where(eq(users.id, confirmationToken.userId)).limit(1)

				if (user?.emailConfirmed) {
					transactionFailureMessage = authenticationMessages.alreadyConfirmed
					transactionFailureStatus = httpStatus.http409conflict
				} else {
					transactionFailureMessage = 'token used'
					transactionFailureStatus = httpStatus.http401unauthorised
				}
				return false
			}

			if (new Date() > new Date(confirmationToken.expiresAt)) {
				transactionFailureMessage = tokenMessages.tokenExpired
				transactionFailureStatus = httpStatus.http401unauthorised
				throw new Error()
			}

			const [user] = await tx.select().from(users).where(eq(users.id, confirmationToken.userId)).limit(1)

			if (!user) {
				transactionFailureMessage = tokenMessages.userNotFound
				transactionFailureStatus = httpStatus.http404notFound
				throw new Error()
			}

			await tx.update(users).set({ emailConfirmed: true }).where(eq(users.id, user.id))

			await tx.update(confirmationTokens).set({ usedAt: new Date() }).where(eq(confirmationTokens.id, confirmationToken.id))
			return true
		})

		if (!result) {
			throw new Error()
		}

		return NextResponse.json({ message: basicMessages.success }, { status: httpStatus.http200ok })
	} catch (error) {
		if (transactionFailureStatus && transactionFailureMessage) {
			logger.error('Transaction failure: ', transactionFailureMessage)
			return NextResponse.json({ message: transactionFailureMessage }, { status: transactionFailureStatus })
		}

		logger.error('Transaction failed: ', error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
