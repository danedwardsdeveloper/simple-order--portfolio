import { emptyToNull } from '@/library/utilities/public'
import { equals, or } from '@/library/utilities/server'
import type { NonEmptyArray, RelationshipRecord } from '@/types'
import { database } from '../../connection'
import { relationships } from '../../schema'

export async function getRelationshipRecords(userId: number): Promise<NonEmptyArray<RelationshipRecord> | null> {
	const records = await database
		.select()
		.from(relationships)
		.where(or(equals(relationships.customerId, userId), equals(relationships.merchantId, userId)))
	return emptyToNull(records)
}
