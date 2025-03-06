import { database } from '@/library/database/connection'
import { freeTrials, subscriptions } from '@/library/database/schema'
import { and, eq, gt } from 'drizzle-orm'

async function checkActiveSubscription(userId: number): Promise<boolean> {
	const [validSubscription] = await database
		.select()
		.from(subscriptions)
		.where(and(gt(subscriptions.currentPeriodEnd, new Date()), eq(subscriptions.userId, userId)))

	if (validSubscription) return true
	return false
}

export async function checkActiveSubscriptionOrTrial(
	userId: number,
	cachedTrialExpired = false,
): Promise<{ activeSubscriptionOrTrial: boolean }> {
	if (cachedTrialExpired) {
		const validSubscription = await checkActiveSubscription(userId)
		if (validSubscription) return { activeSubscriptionOrTrial: true }
	}

	const [validFreeTrial] = await database
		.select()
		.from(freeTrials)
		.where(and(gt(freeTrials.endDate, new Date()), eq(freeTrials.userId, userId)))
	if (validFreeTrial) return { activeSubscriptionOrTrial: true }

	// Check subscriptions table if it was skipped the first time
	const validSubscription = await checkActiveSubscription(userId)
	if (validSubscription) return { activeSubscriptionOrTrial: true }

	return { activeSubscriptionOrTrial: false }
}
