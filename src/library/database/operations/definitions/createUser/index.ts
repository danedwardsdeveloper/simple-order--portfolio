import { defaultAcceptedDeliveryDayIndices } from '@/library/constants'
import { database } from '@/library/database/connection'
import { acceptedDeliveryDays, users } from '@/library/database/schema'
import logger from '@/library/logger'
import { createMerchantSlug } from '@/library/utilities/public'
import { hashPassword } from '@/library/utilities/server'
import type { BaseUserBrowserInputValues, BaseUserInsertValues, DangerousBaseUser } from '@/types'

/**
 * Creates a new user and default delivery days
 * @example
const { createdUser, requestCookie } = await createUser({
	firstName: 'Emily',
	lastName: 'Gilmore',
	businessName: 'Emily Gilmore Enterprises',
	email: 'emilygilmore@gmail.com',
	emailConfirmed: true,
	password: 'securePassword123',
})
 */
export async function createUser(
	user: BaseUserBrowserInputValues,
	emailConfirmed?: boolean,
): Promise<{
	createdUser: DangerousBaseUser
}> {
	let txErrorMessage: string | undefined

	try {
		const { createdUser } = await database.transaction(async (tx) => {
			const hashedPassword = await hashPassword(user.password)
			const insertValues: BaseUserInsertValues = {
				...user,
				emailConfirmed: emailConfirmed ?? true,
				slug: createMerchantSlug(user.businessName),
				hashedPassword,
			}

			txErrorMessage = 'error creating user row'
			const [createdUser] = await tx.insert(users).values(insertValues).returning()

			txErrorMessage = 'error creating acceptedDeliveryDays'
			await tx
				.insert(acceptedDeliveryDays)
				.values(defaultAcceptedDeliveryDayIndices.map((dayIndex) => ({ userId: createdUser.id, dayOfWeekId: dayIndex })))

			txErrorMessage = undefined
			return { createdUser }
		})

		return { createdUser }
	} catch (error) {
		if (txErrorMessage) logger.error('createUser transaction error: ', txErrorMessage, error)

		logger.error(`Failed to create user for ${user.businessName}`, error)
		throw error
	}
}
