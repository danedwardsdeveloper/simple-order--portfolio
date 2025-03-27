import { database } from '@/library/database/connection'
import { freeTrials, subscriptions } from '@/library/database/schema'
import { and, equals, greaterThan } from '@/library/utilities/server'

async function checkActiveSubscription(userId: number): Promise<boolean> {
	const [validSubscription] = await database
		.select()
		.from(subscriptions)
		.where(and(greaterThan(subscriptions.currentPeriodEnd, new Date()), equals(subscriptions.userId, userId)))
		.limit(1)

	if (validSubscription) return true
	return false
}

export async function checkActiveSubscriptionOrTrial(
	userId: number,
	cachedTrialExpired = false,
): Promise<{ activeSubscriptionOrTrial: boolean; trialExpiry?: Date }> {
	if (cachedTrialExpired) {
		const validSubscription = await checkActiveSubscription(userId)
		if (validSubscription) return { activeSubscriptionOrTrial: true }
	}

	const [validFreeTrial] = await database
		.select()
		.from(freeTrials)
		.where(and(greaterThan(freeTrials.endDate, new Date()), equals(freeTrials.userId, userId)))
		.limit(1)

	if (validFreeTrial) {
		return { activeSubscriptionOrTrial: true, trialExpiry: validFreeTrial.endDate }
	}

	// Check subscriptions table if it was skipped the first time
	const validSubscription = await checkActiveSubscription(userId)
	if (validSubscription) return { activeSubscriptionOrTrial: true }

	return { activeSubscriptionOrTrial: false }
}
