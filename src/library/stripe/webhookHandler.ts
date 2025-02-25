import logger from '@/library/logger'
import type Stripe from 'stripe'
import { apiPaths } from '../constants'
import { handleInvoice } from './invoiceHandler'

export async function webhookHandler(event: Stripe.Event) {
	switch (event.type) {
		case 'invoice.paid':
			await handleInvoice(event.data.object)
			break

		case 'customer.subscription.created':
			break

		case 'payment_intent.succeeded':
			break

		case 'invoice.created':
			break

		case 'payment_intent.created':
			break

		case 'charge.succeeded':
			break

		case 'invoice.finalized':
			break

		case 'customer.subscription.updated':
			break

		case 'customer.updated':
			break

		case 'invoice.updated':
			break

		case 'customer.created':
			break

		case 'payment_method.attached':
			break

		case 'invoice.payment_succeeded':
			break

		case 'checkout.session.completed':
			break

		case 'invoice.payment_failed':
			break

		case 'customer.subscription.deleted':
			break

		case 'customer.subscription.paused':
			break

		case 'customer.subscription.resumed':
			break

		case 'customer.subscription.trial_will_end':
			break
		default:
			logger.debug(`${apiPaths.stripe.webhook}unhandled event type: ${event.type}.`)
	}
}
