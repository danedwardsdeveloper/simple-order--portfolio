import { database } from '@/library/database/connection'
import { freeTrials } from '@/library/database/schema'
import { and, equals, greaterThan } from '@/library/utilities/server'
import type { FreeTrial } from '@/types'

export async function getFreeTrial(userId: number): Promise<FreeTrial | null> {
	const [inDateTrial] = await database
		.select()
		.from(freeTrials)
		.where(and(greaterThan(freeTrials.endDate, new Date()), equals(freeTrials.userId, userId)))
		.limit(1)

	return inDateTrial || null
}
