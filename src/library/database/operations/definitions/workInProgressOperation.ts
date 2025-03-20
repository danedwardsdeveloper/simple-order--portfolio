import { logAndSanitiseApiResponse } from '@/library/utilities/public'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import { and, equals, greaterThan } from '@/library/utilities/server'
import type { DangerousBaseUser } from '@/types'
import type { NextRequest } from 'next/server'
import { database } from '../../connection'
import { freeTrials, users } from '../../schema'

interface Input {
	request: NextRequest
	routeDetail: string
	requireConfirmed?: boolean
	requireSubscriptionOrTrial?: boolean
}

type Output = Promise<{
	success: boolean
	developerMessage?: string
	foundDangerousUser?: DangerousBaseUser
}>

export async function checkAuthentication({
	request,
	routeDetail,
	requireConfirmed = true,
	requireSubscriptionOrTrial = true,
}: Input): Output {
	const { extractedUserId } = await extractIdFromRequestCookie(request)

	let developerMessage = undefined

	if (!extractedUserId) {
		developerMessage = logAndSanitiseApiResponse({ routeDetail, message: '' })
		return { success: false, developerMessage }
	}

	const [foundDangerousUser] = await database.select().from(users).where(equals(users.id, extractedUserId))

	if (!foundDangerousUser) {
		developerMessage = logAndSanitiseApiResponse({ routeDetail, message: '' })
		return { success: false }
	}

	if (requireConfirmed && !foundDangerousUser.emailConfirmed) {
		developerMessage = logAndSanitiseApiResponse({ routeDetail, message: 'email not confirmed' })
		return { success: false }
	}

	if (requireSubscriptionOrTrial) {
		const _validSubscriptionOrTrial = false
		if (!foundDangerousUser.cachedTrialExpired) {
		} else {
			const [_validFreeTrial] = await database
				.select()
				.from(freeTrials)
				.where(and(greaterThan(freeTrials.endDate, new Date()), equals(freeTrials.userId, foundDangerousUser.id)))
		}
	}

	return { success: true, foundDangerousUser }
}
