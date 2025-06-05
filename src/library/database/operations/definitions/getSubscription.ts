import { database } from '@/library/database/connection'
import { subscriptions } from '@/library/database/schema'
import { and, equals, greaterThan } from '@/library/utilities/server'
import type { Subscription } from '@/types'

export async function getSubscription(userId: number): Promise<Subscription | null> {
	const [inDateSubscription] = await database
		.select()
		.from(subscriptions)
		.where(and(greaterThan(subscriptions.currentPeriodEnd, new Date()), equals(subscriptions.userId, userId)))
		.limit(1)

	return inDateSubscription || null
}
