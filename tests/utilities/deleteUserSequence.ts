import { database } from '@/library/database/connection'
import {
	confirmationTokens,
	freeTrials,
	invitations,
	merchantProfiles,
	products,
	relationships,
	subscriptions,
	users,
} from '@/library/database/schema'
import { eq, or } from 'drizzle-orm'

export async function deleteUserSequence(email: string) {
	const [userToDelete] = await database.select().from(users).where(eq(users.email, email))

	if (userToDelete) {
		// Get merchant profile first as we need it for products
		const [merchantProfile] = await database.select().from(merchantProfiles).where(eq(merchantProfiles.userId, userToDelete.id))

		// If they have a merchant profile, delete related merchant data
		if (merchantProfile) {
			// Delete products first (references merchantProfileId)
			await database.delete(products).where(eq(products.ownerId, userToDelete.id))

			// Then delete the merchant profile itself
			await database.delete(merchantProfiles).where(eq(merchantProfiles.userId, userToDelete.id))
		}

		// Delete all relationships in relationships (both as customer and merchant)
		await database
			.delete(relationships)
			.where(or(eq(relationships.customerId, userToDelete.id), eq(relationships.merchantId, userToDelete.id)))

		// Delete references to userId in other tables
		await database.delete(subscriptions).where(eq(subscriptions.userId, userToDelete.id))
		await database.delete(invitations).where(eq(invitations.senderUserId, userToDelete.id))
		await database.delete(freeTrials).where(eq(freeTrials.userId, userToDelete.id))
		await database.delete(confirmationTokens).where(eq(confirmationTokens.userId, userToDelete.id))

		// Finally delete the user
		await database.delete(users).where(eq(users.id, userToDelete.id))
	}
}

// deleteUserSequence('')

/* 
pnpm tsx tests/utilities/deleteUserSequence
*/
