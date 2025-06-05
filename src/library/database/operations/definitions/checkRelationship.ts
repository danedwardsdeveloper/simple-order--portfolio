import { database } from '@/library/database/connection'
import { relationships } from '@/library/database/schema'
import logger from '@/library/logger'
import { and, equals } from '@/library/utilities/server'

// ToDo: check the codebase for places where this function can replace existing code
export async function checkRelationship({
	merchantId,
	customerId,
}: { merchantId: number; customerId: number }): Promise<{ relationshipExists: boolean }> {
	try {
		const [existingRelationship] = await database
			.select()
			.from(relationships)
			.where(and(equals(relationships.customerId, customerId), equals(relationships.merchantId, merchantId)))
		return { relationshipExists: Boolean(existingRelationship) }
	} catch (error) {
		logger.error('database/operations/checkRelationship error: ', error)
		return { relationshipExists: false }
	}
}
