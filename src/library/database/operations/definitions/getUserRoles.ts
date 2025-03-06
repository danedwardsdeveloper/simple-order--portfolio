import { database } from '@/library/database/connection'
import { freeTrials, relationships, subscriptions } from '@/library/database/schema'
import logger from '@/library/logger'
import type { Roles } from '@/types'
import { and, eq, gt } from 'drizzle-orm'

// Optimisation ToDo: Merge this with checkActiveSubscriptionOrTrial as they check the same tables and are mostly used together

export async function getUserRoles(userId: number): Promise<{ userRole: Roles }> {
	try {
		// A merchant is signified by:
		// - an active free-trial
		// OR
		// - an active subscription
		// - OR
		// - a relationship where the user's ID is in the merchant column

		// A customer is signified by:
		// - a relationship where the user's ID is in the customer column

		let isMerchant = false

		const [foundFreeTrial] = await database
			.select()
			.from(freeTrials)
			.where(and(eq(freeTrials.userId, userId), gt(freeTrials.endDate, new Date())))

		if (foundFreeTrial) isMerchant = true

		if (!isMerchant) {
			const [validSubscription] = await database
				.select()
				.from(subscriptions)
				.where(and(gt(subscriptions.currentPeriodEnd, new Date()), eq(subscriptions.userId, userId)))

			if (validSubscription) isMerchant = true
		}

		if (!isMerchant) {
			const [relationshipsAsMerchant] = await database.select().from(relationships).where(eq(relationships.merchantId, userId))
			if (relationshipsAsMerchant) isMerchant = true
		}

		const [isCustomer] = await database.select().from(relationships).where(eq(relationships.customerId, userId))

		const isBoth = isMerchant && isCustomer

		return { userRole: isBoth ? 'both' : isMerchant ? 'merchant' : 'customer' }
	} catch (error) {
		logger.error('getUserRoles error: ', error)
		throw new Error('getUserRoles failed to retrieve user roles')
	}
}
