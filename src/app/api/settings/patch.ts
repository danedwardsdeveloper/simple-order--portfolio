import { userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkAccess } from '@/library/database/operations'
import { users } from '@/library/database/schema'
import { formatFirstError } from '@/library/utilities/public'
import { equals, initialiseResponder } from '@/library/utilities/server'
import { settingsSchema } from '@/library/validations'
import type { UserMessages } from '@/types'
import type { NextRequest, NextResponse } from 'next/server'
import type { z } from 'zod'

/**
 * @example
    cutOffTime?: Date | undefined;
    leadTimeDays?: number | undefined;
    minimumSpendPence?: number | undefined;
 */
export type SettingsPATCHbody = z.infer<typeof settingsSchema>

export type SettingsPATCHresponse = {
	userMessage?: UserMessages
	developmentMessage?: string
}

type Output = Promise<NextResponse<SettingsPATCHresponse>>

/**
 * Updates settings that are stored directly on the user object
 */
export async function PATCH(request: NextRequest): Output {
	const respond = initialiseResponder<SettingsPATCHresponse>()

	try {
		// Best way to parse the body safely
		let rawBody: SettingsPATCHbody
		try {
			rawBody = await request.json()
			if (Object.keys(rawBody).length === 0) {
				return respond({
					status: 400,
					developmentMessage: 'body empty',
				})
			}
		} catch {
			return respond({
				status: 400,
				developmentMessage: 'body missing',
			})
		}

		const validationResult = settingsSchema.safeParse(rawBody)

		if (!validationResult.success) {
			return respond({
				status: 400,
				developmentMessage: formatFirstError(validationResult.error),
			})
		}

		const { dangerousUser, accessDenied } = await checkAccess({
			request,
			requireConfirmed: true,
			requireSubscriptionOrTrial: false,
		})

		if (accessDenied) {
			return respond({
				status: accessDenied.status,
				developmentMessage: accessDenied.message,
			})
		}

		const updateData = Object.fromEntries(Object.entries(validationResult.data).filter(([_, value]) => value !== undefined))

		await database.update(users).set(updateData).where(equals(users.id, dangerousUser.id))

		return respond({ status: 200 })
	} catch (caughtError) {
		return respond({
			body: { userMessage: userMessages.serverError },
			status: 500,
			caughtError,
		})
	}
}
