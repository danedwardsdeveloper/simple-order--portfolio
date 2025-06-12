import { userMessages } from '@/library/constants'
import { checkAccess, getAcceptedWeekDayIndices, getHolidays } from '@/library/database/operations'
import { initialiseResponder } from '@/library/utilities/server'
import type { ApiResponse, SettingsData } from '@/types'
import type { NextRequest, NextResponse } from 'next/server'

type Success = SettingsData & { ok: true }

type Failure = {
	ok: false
	userMessage?: string
	developmentMessage?: string
}

export type SettingsGETresponse = ApiResponse<Success, Failure>

type OutputGET = Promise<NextResponse<SettingsGETresponse>>

// Optimisation - add lookAheadDays search param to extend range on request

// Get information about your own settings as a merchant
export async function GET(request: NextRequest): OutputGET {
	const respond = initialiseResponder<Success, Failure>()
	try {
		const { dangerousUser, accessDenied } = await checkAccess({
			request,
			requireConfirmed: false,
			requireSubscriptionOrTrial: false,
		})

		if (accessDenied) {
			return respond({
				body: {},
				status: accessDenied.status,
				developmentMessage: accessDenied.message,
			})
		}

		const [acceptedWeekDayIndices, holidays] = await Promise.all([
			getAcceptedWeekDayIndices(dangerousUser.id),
			getHolidays({ userId: dangerousUser.id, lookAheadDays: 365 }),
		])

		return respond({
			body: {
				acceptedWeekDayIndices,
				holidays,
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
