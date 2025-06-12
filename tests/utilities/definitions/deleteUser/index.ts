import { developmentDatabase } from '@/library/database/connection'
import {
	acceptedDeliveryDays,
	confirmationTokens,
	freeTrials,
	holidays,
	invitations,
	orderItems,
	orders,
	products,
	relationships,
	subscriptions,
	users,
} from '@/library/database/schema'
import logger from '@/library/logger'
import { equals, inArray, or } from '@/library/utilities/server'
import type { QueryRunner } from '@/types'

export async function deleteUser(email: string, database: QueryRunner = developmentDatabase): Promise<{ success: boolean }> {
	// Use Zod to check email is valid first
	try {
		// Check user exists
		// Don't destructure straight away or it will fail if the user is not found
		const userToDelete = await database.select().from(users).where(equals(users.email, email)).limit(1)

		if (!userToDelete[0]) {
			logger.info('No user found with email: ', email)
			return { success: true }
		}

		const { id: idToDelete, email: emailToDelete } = userToDelete[0]

		// Delete the user's data in order
		await database.transaction(async (tx) => {
			// First, find all orders associated with this user
			const userOrders = await tx
				.select({ id: orders.id })
				.from(orders)
				.where(or(equals(orders.customerId, idToDelete), equals(orders.merchantId, idToDelete)))

			const orderIds = userOrders.map((order) => order.id)

			// Delete all order items for those orders
			if (orderIds.length > 0) {
				await tx.delete(orderItems).where(inArray(orderItems.orderId, orderIds))
			}

			// Then delete the orders
			await tx.delete(orders).where(or(equals(orders.customerId, idToDelete), equals(orders.merchantId, idToDelete)))

			// Then delete everything else
			await tx.delete(invitations).where(
				or(
					equals(invitations.senderUserId, idToDelete), //
					equals(invitations.email, emailToDelete),
				),
			)

			await tx.delete(relationships).where(
				or(
					equals(relationships.customerId, idToDelete), //
					equals(relationships.merchantId, idToDelete),
				),
			)

			await tx.delete(subscriptions).where(
				equals(subscriptions.userId, idToDelete), //
			)

			await tx.delete(products).where(
				equals(products.ownerId, idToDelete), //
			)

			await tx.delete(confirmationTokens).where(
				equals(confirmationTokens.userId, idToDelete), //
			)

			await tx.delete(freeTrials).where(
				equals(freeTrials.userId, idToDelete), //
			)

			await tx.delete(holidays).where(
				equals(holidays.userId, idToDelete), //
			)

			await tx.delete(acceptedDeliveryDays).where(
				equals(acceptedDeliveryDays.userId, idToDelete), //
			)

			// Finally, delete the user
			await tx.delete(users).where(
				equals(users.id, idToDelete), //
			)
		})

		logger.info('Successfully completed deleteUser')
		return { success: true }
	} catch (error) {
		logger.error('deleteUser error: ', error)
		return { success: false }
	}
}
// ;(async () => {
// 	try {
// 		await deleteUser('danedwardscreative@gmail.com', productionDatabase)
// 	} catch {
// 		logger.error('error')
// 	}
// })()

/* 
pnpm tsx tests/utilities/definitions/deleteUser/index.ts
*/
