import { database } from '@/library/database/connection'
import { freeTrials } from '@/library/database/schema'
import logger from '@/library/logger'
import { createFreeTrialEndTime } from '@/library/utilities/public'
import { equals } from '@/library/utilities/server'
import type { FreeTrial, Transaction } from '@/types'

type Input = {
	userId: number
	tx?: Transaction
}

export async function createFreeTrial({ userId, tx }: Input): Promise<FreeTrial> {
	try {
		const queryRunner = tx ?? database
		const startDate = new Date()
		startDate.setUTCHours(0, 0, 0, 0)

		const [freeTrial] = await queryRunner
			.insert(freeTrials)
			.values({ userId, startDate: new Date(), endDate: createFreeTrialEndTime() })
			.returning()

		return freeTrial
	} catch (error) {
		logger.error(`createFreeTrial: failed to create free trial for user with ID ${userId}`, error)
		throw error
	}
}

export async function deleteFreeTrial(userId: number) {
	try {
		await database.delete(freeTrials).where(equals(freeTrials.userId, userId))
	} catch (error) {
		logger.error(`deleteFreeTrial: failed to delete free trial for user with ID ${userId}`, error)
		throw error
	}
}
