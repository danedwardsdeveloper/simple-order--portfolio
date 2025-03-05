import { database } from '@/library/database/connection'
import { relationships } from '@/library/database/schema'
import logger from '@/library/logger'
import type { Roles } from '@/types'
import { eq } from 'drizzle-orm'

export async function getUserRoles(userId: number): Promise<{ userRole: Roles }> {
	try {
		// A merchant is signified by:
		// - an active free-trial or subscription, or confirmed customers

		// A customer is signified by:
		// - a relationship where the user's ID is in the customer column

		const [isCustomer] = await database.select().from(relationships).where(eq(relationships.customerId, userId))
		const [isMerchant] = await database.select().from(relationships).where(eq(relationships.merchantId, userId))

		const isBoth = isMerchant && isCustomer

		return { userRole: isBoth ? 'both' : isMerchant ? 'merchant' : 'customer' }
	} catch (error) {
		logger.error('database/operations/getUserRoles error: ', error)
		throw new Error('database/operations/getUserRoles failed to retrieve user roles')
	}
}
