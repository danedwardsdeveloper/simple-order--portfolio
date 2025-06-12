import { http409conflict, userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkAccess } from '@/library/database/operations'
import { holidays } from '@/library/database/schema'
import { formatFirstError } from '@/library/utilities/public'
import { and, equals, greaterThanOrEqual, initialiseResponder, isNull, or } from '@/library/utilities/server'
import { holidaysSchema } from '@/library/validations'
import type { ApiResponse, HolidayInsert } from '@/types'
import type { NextRequest, NextResponse } from 'next/server'
import type { z } from 'zod'

export type SettingsHolidaysPOSTbody = z.infer<typeof holidaysSchema>

type Success = {
	ok: true
}

type Failure = {
	ok: false
	userMessage:
		| typeof userMessages.serverError
		| typeof userMessages.unexpectedError
		| typeof userMessages.authenticationError
		| typeof userMessages.holidayConflict
	developmentMessage: string
}

export type SettingsHolidaysPOSTresponse = ApiResponse<Success, Failure>

type Output = Promise<NextResponse<SettingsHolidaysPOSTresponse>>

export async function POST(request: NextRequest): Output {
	const respond = initialiseResponder<Success, Failure>()

	try {
		let rawBody: SettingsHolidaysPOSTbody

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

		const validationResult = holidaysSchema.safeParse(rawBody)

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

		const { holidaysToAdd } = validationResult.data

		const currentUtcDate = new Date()
		currentUtcDate.setUTCHours(0, 0, 0, 0)

		const existingHolidays = await database
			.select()
			.from(holidays)
			.where(
				and(
					equals(holidays.userId, dangerousUser.id),
					or(
						greaterThanOrEqual(holidays.endDate, currentUtcDate),
						and(isNull(holidays.endDate), greaterThanOrEqual(holidays.startDate, currentUtcDate)),
					),
				),
			)

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
					body: { userMessage: userMessages.holidayConflict },
					status: http409conflict,
					developmentMessage: userMessages.holidayConflict,
				})
			}
		}

		const insertValues: HolidayInsert[] = holidaysToAdd.map((holiday) => ({
			userId: dangerousUser.id,
			startDate: holiday.startDate,
			endDate: holiday.endDate ?? holiday.startDate,
		}))

		await database.insert(holidays).values(insertValues)

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
