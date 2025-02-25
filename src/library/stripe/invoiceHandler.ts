import type { SubscriptionInsertValues } from '@/types'
import { eq, or } from 'drizzle-orm'
import type Stripe from 'stripe'
import { database } from '../database/connection'
import { subscriptions, users } from '../database/schema'
import { sendEmail } from '../email/sendEmail'
import { sendInvoiceEmail } from '../email/sendInvoice'
import { myPersonalEmail } from '../environment/serverVariables'
import logger from '../logger'

export async function handleInvoice(invoice: Stripe.Invoice) {
	try {
		// Gather information from unreliable Stripe
		const userId = invoice.subscription_details?.metadata?.simpleOrderUserId || invoice.lines?.data?.[0]?.metadata?.simpleOrderUserId
		const email = invoice.customer_email

		const [foundUser] = await database
			.select()
			.from(users)
			.where(
				userId && email
					? or(eq(users.id, Number(userId)), eq(users.email, email))
					: userId
						? eq(users.id, Number(userId))
						: email
							? eq(users.email, email)
							: eq(users.id, -1), // Dummy condition that won't match if no identifiers
			)

		if (!foundUser) {
			logger.error("Invoice handler couldn't retrieve user from database using invoice. Invoice: ", invoice)
		}

		const subscriptionData: SubscriptionInsertValues = {
			userId: Number(foundUser.id),
			stripeCustomerId: String(invoice.customer),
			currentPeriodStart: new Date(invoice.lines.data[0].period.start * 1000),
			currentPeriodEnd: new Date(invoice.lines.data[0].period.end * 1000),
		}

		const [existingSubscription] = await database
			.select()
			.from(subscriptions)
			.where(eq(subscriptions.userId, subscriptionData.userId))
			.limit(1)

		let updatedSubscription = null
		let newSubscription = null

		if (existingSubscription) {
			;[updatedSubscription] = await database
				.update(subscriptions)
				.set({
					stripeCustomerId: subscriptionData.stripeCustomerId,
					currentPeriodStart: subscriptionData.currentPeriodStart,
					currentPeriodEnd: subscriptionData.currentPeriodEnd,
					cancelledAt: null,
				})
				.where(eq(subscriptions.id, existingSubscription.id))
				.returning()

			logger.info(`Updated existing subscription for user ${foundUser.id}`)
		} else {
			;[newSubscription] = await database.insert(subscriptions).values(subscriptionData).returning()
			logger.info(`Created new subscription for user ${foundUser.id}`)
		}

		if (!newSubscription && !updatedSubscription) {
			logger.error('Invoice handler failed to update an existing subscription or create a new one')
		}

		const invoiceSentViaEmail = await sendInvoiceEmail(foundUser, invoice)
		if (!invoiceSentViaEmail) {
			logger.error('Invoice handler failed send invoice')
		}

		const sentEmailToMyself = await sendEmail({
			recipientEmail: myPersonalEmail,
			subject: 'New subscription!',
			htmlVersion: 'Simple Order has a new paying subscriber!',
			textVersion: 'Simple Order has a new paying subscriber!',
		})

		if (!sentEmailToMyself) {
			logger.error('Invoice handler failed to send email to myself')
		}
	} catch (error) {
		logger.error('webhookHandler customer.subscription.created error: ', error)
	}
}
