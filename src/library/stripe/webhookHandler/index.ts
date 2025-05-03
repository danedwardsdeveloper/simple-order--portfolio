import logger from '@/library/logger'
import type Stripe from 'stripe'
import { handleSubscriptionCreated } from './events/handleSubscriptionCreated'
import { handleSubscriptionUpdated } from './events/handleSubscriptionUpdated'
import { handleInvoice } from './events/invoice'

export async function webhookHandler(event: Stripe.Event) {
	const eventType = event.type

	logger.info('Event name: ', eventType)

	switch (eventType) {
		// This could include a trial, so payment hasn't necessarily been taken
		case 'customer.subscription.created':
			await handleSubscriptionCreated(event.data.object)
			break

		// A payment was made for a new/recurring subscription
		case 'invoice.paid':
			await handleInvoice(event.data.object)
			break

		// Not sure how this is different to updated?
		case 'customer.subscription.deleted':
			break

		// When a subscription is updated (trial ends, plan changes, etc.)
		case 'customer.subscription.updated':
			await handleSubscriptionUpdated(event.data.object)
			break

		// When a payment fails. Might need to send an email or offer grace access
		case 'invoice.payment_failed':
			break

		default:
			logger.debug(`webhookHandler: unhandled event type: ${event.type}.`)
	}
}
