import { database } from '@/library/database/connection'
import { relationships } from '@/library/database/schema'
import logger from '@/library/logger'
import type { AsyncSuccessFlag, RelationshipJoinRow } from '@/types'

export async function createRelationship({ customerId, merchantId }: RelationshipJoinRow): AsyncSuccessFlag {
	try {
		await database.insert(relationships).values({
			merchantId,
			customerId,
		})
		return { success: true }
	} catch (error) {
		logger.error(`Failed to create relationship between merchant with ID ${merchantId} and customer with ID ${customerId}`, error)
		return { success: false }
	}
}
