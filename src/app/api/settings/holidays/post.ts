import { http409conflict, userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkAccess } from '@/library/database/operations'
import { holidays } from '@/library/database/schema'
import { equals, formatFirstError, initialiseResponder } from '@/library/utilities/server'
import { holidaysSchema } from '@/library/validations'
import type { HolidayInsert, UserMessages } from '@/types'
import type { NextRequest, NextResponse } from 'next/server'
import type { z } from 'zod'

export type SettingsHolidaysPOSTbody = z.infer<typeof holidaysSchema>

export type SettingsHolidaysPOSTresponse = {
	userMessage?: UserMessages
	developmentMessage?: string
}

type Output = Promise<NextResponse<SettingsHolidaysPOSTresponse>>

export async function POST(request: NextRequest): Output {
	const respond = initialiseResponder<SettingsHolidaysPOSTresponse>()

	try {
		let rawBody: SettingsHolidaysPOSTbody

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

		const validationResult = holidaysSchema.safeParse(rawBody)

		if (!validationResult.success) {
			return respond({
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
				status: accessDenied.status,
				developmentMessage: accessDenied.message,
			})
		}

		const { holidaysToAdd } = validationResult.data

		const existingHolidays = await database.select().from(holidays).where(equals(holidays.userId, dangerousUser.id))

		for (const newHoliday of holidaysToAdd) {
			const newStart = newHoliday.startDate
			const newEnd = newHoliday.endDate ?? newHoliday.startDate

			const hasOverlap = existingHolidays.some((existing) => {
				return (
					(newStart >= existing.startDate && newStart <= existing.endDate) ||
					(newEnd >= existing.startDate && newEnd <= existing.endDate) ||
					(newStart <= existing.startDate && newEnd >= existing.endDate)
				)
			})

			if (hasOverlap) {
				return respond({
					body: { userMessage: 'This holiday period overlaps with an existing holiday' },
					status: http409conflict,
					developmentMessage: 'conflict',
				})
			}
		}

		const insertValues: HolidayInsert[] = holidaysToAdd.map((holiday) => ({
			userId: dangerousUser.id,
			startDate: holiday.startDate,
			endDate: holiday.endDate ?? holiday.startDate,
		}))

		await database.insert(holidays).values(insertValues)

		return respond({ status: 200 })
	} catch (caughtError) {
		return respond({
			body: { userMessage: userMessages.serverError },
			status: 500,
			caughtError,
		})
	}
}
