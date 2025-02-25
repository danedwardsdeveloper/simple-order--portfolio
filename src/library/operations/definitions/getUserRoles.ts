import { database } from '@/library/database/connection'
import { merchantProfiles, relationships } from '@/library/database/schema'
import logger from '@/library/logger'
import type { Roles } from '@/types'
import { eq } from 'drizzle-orm'

export async function getUserRoles(userId: number): Promise<{ userRole: Roles }> {
	try {
		let isBoth = false

		const [isMerchant] = await database.select().from(merchantProfiles).where(eq(merchantProfiles.userId, userId))

		logger.debug('isMerchant: ', isMerchant)

		const [isCustomer] = await database.select().from(relationships).where(eq(relationships.customerId, userId))

		logger.debug('isCustomer: ', isCustomer)

		if (isMerchant && isCustomer) isBoth = true

		logger.debug('isBoth: ', isBoth)

		return { userRole: isBoth ? 'both' : isMerchant ? 'merchant' : 'customer' }
	} catch (error) {
		logger.error('database/operations/getUserRoles error: ', error)
		throw new Error('database/operations/getUserRoles failed to retrieve user roles')
	}
}
