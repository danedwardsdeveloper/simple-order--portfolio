import { database } from '@/library/database/connection'
import { freeTrials, invitations, relationships, subscriptions } from '@/library/database/schema'
import logger from '@/library/logger'
import { and, equals, greaterThan } from '@/library/utilities/server'
import type { DangerousBaseUser, Roles } from '@/types'

/**
 * @deprecated This does too many things. needs to be split up.
 */
export async function getUserRoles(user: DangerousBaseUser): Promise<{ userRole: Roles }> {
	try {
		// A merchant is signified by:
		// - an active free-trial or subscription OR
		// - a relationship where the user's ID is in the merchant column

		// A customer is signified by:
		// An invitation where the user's email is the recipient email OR
		// - a relationship where the user's ID is in the customer column

		let isMerchant = false

		const nowUTC = new Date()
		nowUTC.setHours(0, 0, 0, 0)

		const [foundFreeTrial] = await database
			.select()
			.from(freeTrials)
			.where(and(equals(freeTrials.userId, user.id), greaterThan(freeTrials.endDate, nowUTC)))
			.limit(1)

		if (foundFreeTrial) isMerchant = true

		if (!isMerchant) {
			const [validSubscription] = await database
				.select()
				.from(subscriptions)
				.where(and(greaterThan(subscriptions.currentPeriodEnd, new Date()), equals(subscriptions.userId, user.id)))
				.limit(1)

			if (validSubscription) isMerchant = true
		}

		if (!isMerchant) {
			const [relationshipsAsMerchant] = await database
				.select()
				.from(relationships)
				.where(equals(relationships.merchantId, user.id))
				.limit(1)
			if (relationshipsAsMerchant) isMerchant = true
		}

		let isCustomer = false

		const [foundRelationship] = await database.select().from(relationships).where(equals(relationships.customerId, user.id)).limit(1)

		if (foundRelationship) isCustomer = true

		if (!isCustomer) {
			const [foundInvitation] = await database.select().from(invitations).where(equals(invitations.email, user.email)).limit(1)
			if (foundInvitation) isCustomer = true
		}

		const isBoth = isMerchant && isCustomer

		return { userRole: isBoth ? 'both' : isMerchant ? 'merchant' : 'customer' }
	} catch (error) {
		logger.error('getUserRoles error: ', error)
		throw new Error('getUserRoles failed to retrieve user roles')
	}
}
