import { and, eq, gt } from 'drizzle-orm'

import { customerToMerchant, freeTrials, subscriptions, users } from '@/library/database/schema'

import type { DangerousBaseUser } from '@/types'
import logger from '../logger'
import { database } from './connection'

interface CheckUserExistsResponse {
	userExists: boolean
	existingUser?: {
		emailConfirmed: boolean
		cachedTrialExpired: boolean
		businessName: string
		email: string
	}
}

export async function checkUserExists(userId: number): Promise<CheckUserExistsResponse> {
	const [existingUser]: DangerousBaseUser[] = await database.select().from(users).where(eq(users.id, userId)).limit(1)

	if (!existingUser) return { userExists: false }

	return {
		userExists: true,
		existingUser: {
			emailConfirmed: existingUser.emailConfirmed,
			cachedTrialExpired: existingUser.cachedTrialExpired,
			businessName: existingUser.businessName,
			email: existingUser.email,
		},
	}
}

// Helper function. Used twice in checkActiveSubscriptionOrTrial to avoid looking in free_trials if cached_trial_expired is true
async function checkActiveSubscription(userId: number): Promise<boolean> {
	const [validSubscription] = await database
		.select()
		.from(subscriptions)
		.where(and(gt(subscriptions.currentPeriodEnd, new Date()), eq(subscriptions.userId, userId)))
		.limit(1)

	if (validSubscription) return true
	return false
}

/* Usage
const { validSubscriptionOrTrial } = await checkActiveSubscriptionOrTrial(extractedUserId, cachedTrialExpired)
*/
export async function checkActiveSubscriptionOrTrial(
	userId: number,
	cachedTrialExpired = false,
): Promise<{ validSubscriptionOrTrial: boolean }> {
	if (cachedTrialExpired) {
		const validSubscription = await checkActiveSubscription(userId)
		if (validSubscription) return { validSubscriptionOrTrial: true }
	}

	const [validFreeTrial] = await database
		.select()
		.from(freeTrials)
		.where(and(gt(freeTrials.endDate, new Date()), eq(freeTrials.userId, userId)))
		.limit(1)
	if (validFreeTrial) return { validSubscriptionOrTrial: true }

	// Check subscriptions table if it was skipped the first time
	const validSubscription = await checkActiveSubscription(userId)
	if (validSubscription) return { validSubscriptionOrTrial: true }

	return { validSubscriptionOrTrial: false }
}

// ToDo: check the codebase for places where this function can replace existing code
export async function checkRelationship({
	merchantId,
	customerId,
}: { merchantId: number; customerId: number }): Promise<{ relationshipExists: boolean }> {
	try {
		const [existingRelationship] = await database
			.select()
			.from(customerToMerchant)
			.where(and(eq(customerToMerchant.customerUserId, customerId), eq(customerToMerchant.merchantUserId, merchantId)))
		return { relationshipExists: Boolean(existingRelationship) }
	} catch (error) {
		logger.error('database/operations/checkRelationship error: ', error)
		return { relationshipExists: false }
	}
}
