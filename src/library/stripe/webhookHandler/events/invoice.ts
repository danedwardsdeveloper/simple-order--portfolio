import { database } from '@/library/database/connection'
import { subscriptions, users } from '@/library/database/schema'
import { sendEmail } from '@/library/email/sendEmail'
import { sendInvoiceEmail } from '@/library/email/sendInvoice'
import { myPersonalEmail } from '@/library/environment/serverVariables'
import logger from '@/library/logger'
import { equals, or } from '@/library/utilities/server'
import type { SubscriptionInsertValues } from '@/types'
import type Stripe from 'stripe'

export async function handleInvoice(invoice: Stripe.Invoice) {
	try {
		// Gather information from unreliable Stripe
		const userId = invoice.subscription_details?.metadata?.simpleOrderUserId || invoice.lines?.data?.[0]?.metadata?.simpleOrderUserId
		const email = invoice.customer_email

		// ToDo: this is very complicated and confusing
		const [foundUser] = await database
			.select()
			.from(users)
			.where(
				userId && email
					? or(equals(users.id, Number(userId)), equals(users.email, email))
					: userId
						? equals(users.id, Number(userId))
						: email
							? equals(users.email, email)
							: equals(users.id, -1), // Dummy condition that won't match if no identifiers
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
			.where(equals(subscriptions.userId, subscriptionData.userId))
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
				})
				.where(equals(subscriptions.id, existingSubscription.id))
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
