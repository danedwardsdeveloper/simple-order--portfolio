import { userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkAccess } from '@/library/database/operations'
import { acceptedDeliveryDays } from '@/library/database/schema'
import { formatFirstError } from '@/library/utilities/public'
import { equals, initialiseResponder } from '@/library/utilities/server'
import { deliveryDaysSchema } from '@/library/validations'
import type { ApiResponse } from '@/types'
import type { NextRequest, NextResponse } from 'next/server'
import type { z } from 'zod'

export type SettingsDeliveryDaysPATCHbody = z.infer<typeof deliveryDaysSchema>

type Success = {
	ok: true
}

type Failure = {
	ok: false
	userMessage: typeof userMessages.unexpectedError | typeof userMessages.serverError | typeof userMessages.authenticationError
	developmentMessage: string
}

export type SettingsDeliveryDaysPATCHresponse = ApiResponse<Success, Failure>

type Output = Promise<NextResponse<SettingsDeliveryDaysPATCHresponse>>

export async function PATCH(request: NextRequest): Output {
	const respond = initialiseResponder<Success, Failure>()

	try {
		let rawBody: SettingsDeliveryDaysPATCHbody
		try {
			rawBody = await request.json()
			if (Object.keys(rawBody).length === 0) {
				return respond({
					body: { userMessage: userMessages.unexpectedError },
					status: 400,
					developmentMessage: 'body empty',
				})
			}
		} catch {
			return respond({
				body: { userMessage: userMessages.unexpectedError },
				status: 400,
				developmentMessage: 'body missing',
			})
		}

		const validationResult = deliveryDaysSchema.safeParse(rawBody)

		if (!validationResult.success) {
			return respond({
				body: { userMessage: userMessages.unexpectedError },
				status: 400,
				developmentMessage: formatFirstError(validationResult.error),
			})
		}

		const { dangerousUser, accessDenied } = await checkAccess({
			request,
			requireConfirmed: true,
			requireSubscriptionOrTrial: true,
		})

		if (accessDenied) {
			return respond({
				body: { userMessage: userMessages.authenticationError },
				status: accessDenied.status,
				developmentMessage: accessDenied.message,
			})
		}

		const { updatedWeekDayIndexes } = validationResult.data

		await database.transaction(async (tx) => {
			await tx.delete(acceptedDeliveryDays).where(equals(acceptedDeliveryDays.userId, dangerousUser.id))

			await tx.insert(acceptedDeliveryDays).values(
				updatedWeekDayIndexes.map((dayIndex) => ({
					userId: dangerousUser.id,
					dayOfWeekId: dayIndex,
				})),
			)
		})

		return respond({
			body: {}, //
			status: 200,
		})
	} catch (caughtError) {
		return respond({
			body: { userMessage: userMessages.serverError },
			status: 500,
			caughtError,
		})
	}
}
