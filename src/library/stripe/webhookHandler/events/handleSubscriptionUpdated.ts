import { database } from '@/library/database/connection'
import { subscriptions } from '@/library/database/schema'
import logger from '@/library/logger'
import type Stripe from 'stripe'
export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
	try {
		const simpleOrderUserId = Number(subscription.metadata.simpleOrderUserId)
		if (!simpleOrderUserId) {
			logger.error('Simple Order ID missing from Stripe customer.subscription.created event')
		}

		await database.update(subscriptions).set({ cancelledAt: new Date() })

		// subscription.cancellation_details?.comment
		// subscription.cancellation_details?.feedback

		// Send email with cancellation details to user and myself
	} catch (error) {
		logger.error('handleSubscriptionCancelled failed to update subscription row', error)
	}
}
