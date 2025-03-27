import { database } from '@/library/database/connection'
import { users } from '@/library/database/schema'
import logger from '@/library/logger'
import { equals } from '@/library/utilities/server'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import type { DangerousBaseUser } from '@/types'
import type { NextRequest } from 'next/server'
import { checkActiveSubscriptionOrTrial } from './checkActiveSubscriptionOrTrial'

interface Input {
	request: NextRequest
	routeSignature: string
	requireConfirmed: boolean
	requireSubscriptionOrTrial: boolean
	// checkRoles: boolean
	// checkRelationshipWith: number
}

interface Output {
	dangerousUser?: DangerousBaseUser
}

export async function checkAccess({ request, routeSignature, requireConfirmed, requireSubscriptionOrTrial }: Input): Promise<Output> {
	const { extractedUserId, message } = await extractIdFromRequestCookie(request)

	if (!extractedUserId || message === 'token missing') {
		return {}
	}

	const [dangerousUser] = await database.select().from(users).where(equals(users.id, extractedUserId))

	if (!dangerousUser) {
		logger.error(routeSignature, 'User not found')
		return {}
	}

	if (requireConfirmed && !dangerousUser.emailConfirmed) {
		logger.error(routeSignature, 'Email not confirmed')
		return {}
	}

	if (requireSubscriptionOrTrial) {
		const { activeSubscriptionOrTrial } = await checkActiveSubscriptionOrTrial(dangerousUser.id, dangerousUser.cachedTrialExpired)
		if (!activeSubscriptionOrTrial) {
			logger.error(routeSignature, 'Active trial or subscription not found')
			return {}
		}
	}

	return { dangerousUser }
}
