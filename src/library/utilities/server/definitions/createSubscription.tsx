import { database } from '@/library/database/connection'
import { subscriptions } from '@/library/database/schema'
import logger from '@/library/logger'
import type { AsyncSuccessFlag, SubscriptionInsertValues } from '@/types'

export async function createSubscription({
	userId,
	stripeCustomerId,
	currentPeriodEnd,
	currentPeriodStart,
}: SubscriptionInsertValues): AsyncSuccessFlag {
	try {
		await database.insert(subscriptions).values({
			userId,
			stripeCustomerId,
			currentPeriodStart,
			currentPeriodEnd,
		})

		return { success: true }
	} catch (error) {
		logger.error('createSubscription: failed to create subscription', error)
		return { success: false }
	}
}
