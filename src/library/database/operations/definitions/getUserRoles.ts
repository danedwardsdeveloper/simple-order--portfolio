import { database } from '@/library/database/connection'
import { freeTrials, invitations, relationships, subscriptions } from '@/library/database/schema'
import logger from '@/library/logger'
import type { DangerousBaseUser, Roles } from '@/types'
import { and, eq, gt } from 'drizzle-orm'

// Optimisation ToDo: Merge this with checkActiveSubscriptionOrTrial as they check the same tables and are mostly used together

export async function getUserRoles(user: DangerousBaseUser): Promise<{ userRole: Roles }> {
	try {
		// A merchant is signified by:
		// - an active free-trial OR
		// - an active subscription OR
		// - a relationship where the user's ID is in the merchant column

		// A customer is signified by:
		// An invitation where the user's email is the recipient email OR
		// - a relationship where the user's ID is in the customer column

		let isMerchant = false

		const [foundFreeTrial] = await database
			.select()
			.from(freeTrials)
			.where(and(eq(freeTrials.userId, user.id), gt(freeTrials.endDate, new Date())))
			.limit(1)

		if (foundFreeTrial) isMerchant = true

		if (!isMerchant) {
			const [validSubscription] = await database
				.select()
				.from(subscriptions)
				.where(and(gt(subscriptions.currentPeriodEnd, new Date()), eq(subscriptions.userId, user.id)))
				.limit(1)

			if (validSubscription) isMerchant = true
		}

		if (!isMerchant) {
			const [relationshipsAsMerchant] = await database.select().from(relationships).where(eq(relationships.merchantId, user.id)).limit(1)
			if (relationshipsAsMerchant) isMerchant = true
		}

		let isCustomer = false

		const [foundRelationship] = await database.select().from(relationships).where(eq(relationships.customerId, user.id)).limit(1)

		if (foundRelationship) isCustomer = true

		if (!isCustomer) {
			const [foundInvitation] = await database.select().from(invitations).where(eq(invitations.email, user.email)).limit(1)
			if (foundInvitation) isCustomer = true
		}

		const isBoth = isMerchant && isCustomer

		return { userRole: isBoth ? 'both' : isMerchant ? 'merchant' : 'customer' }
	} catch (error) {
		logger.error('getUserRoles error: ', error)
		throw new Error('getUserRoles failed to retrieve user roles')
	}
}
