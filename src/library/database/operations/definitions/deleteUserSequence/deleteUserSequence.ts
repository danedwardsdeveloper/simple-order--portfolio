import { database } from '@/library/database/connection'
import { confirmationTokens, freeTrials, users } from '@/library/database/schema'
import logger from '@/library/logger'
import { equals } from '@/library/utilities/server'

export async function deleteUserSequence(email: string): Promise<{ success: boolean }> {
	try {
		const userToDelete = await database.select().from(users).where(equals(users.email, email)).limit(1)

		if (userToDelete.length === 0) {
			logger.info('No user found with email: ', email)
			return { success: true }
		}

		const userId = userToDelete[0].id

		await database.transaction(async (tx) => {
			await tx.delete(confirmationTokens).where(equals(confirmationTokens.userId, userId))
			await tx.delete(freeTrials).where(equals(freeTrials.userId, userId))
			await tx.delete(users).where(equals(users.id, userId))
		})

		logger.info('Successfully completed deleteUserSequence')
		return { success: true }
	} catch (error) {
		logger.error('deleteUserSequence error: ', error)
		return { success: false }
	}
}
