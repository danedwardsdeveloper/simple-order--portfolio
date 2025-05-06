import { database } from '@/library/database/connection'
import { freeTrials, subscriptions } from '@/library/database/schema'
import { and, equals, greaterThan } from '@/library/utilities/server'

type Output = Promise<{
	trialEnd?: Date
	subscriptionEnd?: Date
	subscriptionCancelled: boolean
}>

export async function checkActiveSubscriptionOrTrial(userId: number): Output {
	const nowUTC = new Date()
	nowUTC.setUTCHours(0, 0, 0, 0)
	const [inDateTrial] = await database
		.select()
		.from(freeTrials)
		.where(and(greaterThan(freeTrials.endDate, nowUTC), equals(freeTrials.userId, userId)))
		.limit(1)

	let trialEnd: Date | undefined

	if (inDateTrial) trialEnd = inDateTrial.endDate

	const [inDateSubscription] = await database
		.select()
		.from(subscriptions)
		.where(and(greaterThan(subscriptions.currentPeriodEnd, new Date()), equals(subscriptions.userId, userId)))
		.limit(1)

	let subscriptionEnd: Date | undefined
	if (inDateSubscription) subscriptionEnd = inDateSubscription.currentPeriodEnd
	const subscriptionCancelled = inDateSubscription ? Boolean(inDateSubscription.cancelledAt) : false

	return { trialEnd, subscriptionEnd, subscriptionCancelled }
}
