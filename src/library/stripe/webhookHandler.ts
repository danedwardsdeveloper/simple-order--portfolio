import logger from '@/library/logger'
import type { SubscriptionInsertValues } from '@/types'
import { eq } from 'drizzle-orm'
import type Stripe from 'stripe'
import { apiPaths } from '../constants'
import { database } from '../database/connection'
import { subscriptions, users } from '../database/schema'

export async function webhookHandler(event: Stripe.Event) {
	switch (event.type) {
		// invoice.paid should be the single source of truth
		// https://www.pedroalonso.net/blog/stripe-webhooks-solving-race-conditions/
		case 'invoice.paid':
			try {
				const invoice = event.data.object as Stripe.Invoice

				// ToDo: this is really important
				if (!invoice.customer_email) {
					logger.error(`No customer email for invoice ${invoice.id}, cannot match to user`)
					break
				}

				let simpleOrderUserId = Number(invoice.subscription_details?.metadata.simpleOrderUserId) | null

				if (!simpleOrderUserId) {
					;[{ simpleOrderUserId }] = await database
						.select({ simpleOrderUserId: users.id })
						.from(users)
						.where(eq(users.email, invoice.customer_email))
						.limit(1)
				}

				if (!simpleOrderUserId) {
					logger.error("Couldn't retrieve Simple Order customer ID from checkout.invoice.completed. Invoice: ", invoice)
				}

				const values: SubscriptionInsertValues = {
					userId: Number(simpleOrderUserId),
					stripeCustomerId: String(invoice.customer),
					currentPeriodStart: new Date(invoice.lines.data[0].period.start * 1000),
					currentPeriodEnd: new Date(invoice.lines.data[0].period.end * 1000),
				}

				logger.debug('Subscription insert values: ', values)

				await database.insert(subscriptions).values(values)
			} catch (error) {
				logger.error('webhookHandler customer.subscription.created error: ', error)
			}
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

		// cspell:disable
		// contains:
		//   "customer_email": "myemail@gmail.com",
		// "metadata": { "email": "myemail@gmail.com", "simpleOrderUserId": "148" },
		//   "subscription": "sub_1Qw4bEKCyKQPfgmWIqA1HjlO",
		// cspell:enable
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
