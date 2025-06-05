import logger from '@/library/logger'
import type Stripe from 'stripe'
export async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
	const simpleOrderUserId = subscription.metadata.simpleOrderUserId
	if (!simpleOrderUserId) {
		logger.error('Simple Order ID missing from Stripe customer.subscription.created event')
	}

	// Move database logic here
	return
}
