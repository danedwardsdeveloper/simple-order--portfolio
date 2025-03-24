import logger from '@/library/logger'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import { equals } from '@/library/utilities/server'
import type { DangerousBaseUser } from '@/types'
import type { NextRequest } from 'next/server'
import { database } from '../../connection'
import { users } from '../../schema'
import { checkActiveSubscriptionOrTrial } from './checkActiveSubscriptionOrTrial'

interface Input {
	request: NextRequest
	routeDetail: string
	requireConfirmed: boolean
	requireSubscriptionOrTrial: boolean
	// checkRoles: boolean
	// checkRelationshipWith: number
}

interface Output {
	dangerousUser?: DangerousBaseUser
}

export async function checkAccess({ request, routeDetail, requireConfirmed, requireSubscriptionOrTrial }: Input): Promise<Output> {
	const { extractedUserId } = await extractIdFromRequestCookie(request)

	// Delete cookies and sign out?
	// Get user roles

	if (!extractedUserId) {
		logger.error(routeDetail, "Couldn't extract user ID")
		return {}
	}

	const [dangerousUser] = await database.select().from(users).where(equals(users.id, extractedUserId))

	if (!dangerousUser) {
		logger.error(routeDetail, 'User not found')
		return {}
	}

	if (requireConfirmed && !dangerousUser.emailConfirmed) {
		logger.error(routeDetail, 'Email not confirmed')
		return {}
	}

	if (requireSubscriptionOrTrial) {
		const { activeSubscriptionOrTrial } = await checkActiveSubscriptionOrTrial(dangerousUser.id, dangerousUser.cachedTrialExpired)
		if (!activeSubscriptionOrTrial) {
			logger.error(routeDetail, 'Active trial or subscription not found')
			return {}
		}
	}

	return { dangerousUser }
}
