import { userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkAccess, getAcceptedWeekDays } from '@/library/database/operations'
import { holidays, users } from '@/library/database/schema'
import { and, equals, formatFirstError, initialiseResponder } from '@/library/utilities/server'
import { settingsSchema } from '@/library/validations'
import type { DayOfTheWeek, Holiday, UserMessages } from '@/types'
import type { NextRequest, NextResponse } from 'next/server'
import type { z } from 'zod'

export type SettingsGETresponse = {
	userMessage?: string
	developmentMessage?: string
	acceptedDeliveryDays?: DayOfTheWeek[]
	holidays?: Holiday[]
}

type OutputGET = Promise<NextResponse<SettingsGETresponse>>

// Get information about your own settings as a merchant
export async function GET(request: NextRequest): OutputGET {
	const respond = initialiseResponder<SettingsGETresponse>()
	try {
		const { dangerousUser, accessDenied } = await checkAccess({
			request,
			requireConfirmed: false,
			requireSubscriptionOrTrial: false,
		})

		if (accessDenied) {
			return respond({
				status: accessDenied.status,
				developmentMessage: accessDenied.message,
			})
		}

		const acceptedDeliveryDays = await getAcceptedWeekDays(dangerousUser.id)

		const merchantHolidays: Holiday[] = await database
			.select({ startDate: holidays.startDate, endDate: holidays.endDate })
			.from(holidays)
			.where(and(equals(holidays.userId, dangerousUser.id)))
			.orderBy(holidays.startDate)

		return respond({
			body: {
				acceptedDeliveryDays,
				holidays: merchantHolidays,
			},
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

export type SettingsPATCHbody = z.infer<typeof settingsSchema>

export type SettingsPATCHresponse = {
	userMessage?: UserMessages
	developmentMessage?: string
}

type OutputPATCH = Promise<NextResponse<SettingsPATCHresponse>>

export async function PATCH(request: NextRequest): OutputPATCH {
	const respond = initialiseResponder<SettingsPATCHresponse>()

	try {
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

		const validatedSettings = validationResult.data

		const updateData: Partial<{
			cutOffTime: Date
			leadTimeDays: number
		}> = {}

		if (validatedSettings.cutOffTime !== undefined) {
			updateData.cutOffTime = validatedSettings.cutOffTime
		}

		if (validatedSettings.leadTimeDays !== undefined) {
			updateData.leadTimeDays = validatedSettings.leadTimeDays
		}

		await database.update(users).set(updateData).where(equals(users.id, dangerousUser.id))

		return respond({
			status: 200,
			developmentMessage: '',
		})
	} catch (caughtError) {
		return respond({
			body: { userMessage: userMessages.serverError },
			status: 500,
			caughtError,
		})
	}
}
