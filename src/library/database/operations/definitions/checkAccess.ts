import { database } from '@/library/database/connection'
import { users } from '@/library/database/schema'
import logger from '@/library/logger'
import { equals } from '@/library/utilities/server'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import type { DangerousBaseUser } from '@/types'
import type { NextRequest } from 'next/server'
import { checkActiveSubscriptionOrTrial } from './checkActiveSubscriptionOrTrial'

/**
 * Validates user access permissions for protected routes
 * @param {Object} params - The parameters object
 * @param {NextRequest} params.request - The Next.js request object containing cookies
 * @param {string} params.routeSignature - Identifier for the route being accessed for logging
 * @param {boolean} params.requireConfirmed
 * @param {boolean} params.requireSubscriptionOrTrial
 */
export async function checkAccess({
	request,
	routeSignature,
	requireConfirmed,
	requireSubscriptionOrTrial,
}: {
	request: NextRequest
	routeSignature: string
	requireConfirmed: boolean
	requireSubscriptionOrTrial: boolean
}): Promise<{
	dangerousUser?: DangerousBaseUser
	trialExpiry?: Date
}> {
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

	const { activeSubscriptionOrTrial, trialExpiry } = await checkActiveSubscriptionOrTrial(
		dangerousUser.id,
		dangerousUser.cachedTrialExpired,
	)

	if (requireSubscriptionOrTrial && !activeSubscriptionOrTrial) {
		logger.error(routeSignature, 'Active trial or subscription not found')
		return {}
	}

	return { dangerousUser, trialExpiry }
}
