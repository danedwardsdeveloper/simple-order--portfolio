import { userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkAccess, getAcceptedWeekDayIndices } from '@/library/database/operations'
import { holidays } from '@/library/database/schema'
import { and, equals, initialiseResponder } from '@/library/utilities/server'
import type { Holiday, WeekDayIndex } from '@/types'
import type { NextRequest, NextResponse } from 'next/server'

export type SettingsGETresponse = {
	userMessage?: string
	developmentMessage?: string
	acceptedWeekDayIndices?: WeekDayIndex[]
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

		const acceptedWeekDayIndices = await getAcceptedWeekDayIndices(dangerousUser.id)

		const merchantHolidays: Holiday[] = await database
			.select({ startDate: holidays.startDate, endDate: holidays.endDate })
			.from(holidays)
			.where(and(equals(holidays.userId, dangerousUser.id)))
			.orderBy(holidays.startDate)

		return respond({
			body: {
				acceptedWeekDayIndices,
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
