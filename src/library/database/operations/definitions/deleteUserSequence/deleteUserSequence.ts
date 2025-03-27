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
			tx.delete(confirmationTokens).where(equals(confirmationTokens.userId, userId))

			tx.delete(freeTrials).where(equals(freeTrials.userId, userId))

			tx.delete(users).where(equals(users.id, userId))
		})

		return { success: true }
	} catch (error) {
		logger.error('deleteUserSequence error: ', error)
		return { success: false }
	}
	// orderItems (depends on orders)
	// orders (depends on users)
	// invitations (depends on users)
	// confirmationTokens (depends on users)
	// freeTrials (depends on users)
	// subscriptions (depends on users)
	// products (depends on users)
	// relationships (depends on users)
	// users (can be deleted last since everything else references it)
}
