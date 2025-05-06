import { friday, monday, thursday, tuesday, wednesday } from '@/library/constants'
import { database } from '@/library/database/connection'
import { acceptedDeliveryDays, users } from '@/library/database/schema'
import logger from '@/library/logger'
import { createMerchantSlug } from '@/library/utilities/public'
import { hashPassword } from '@/library/utilities/server'
import type { BaseUserInsertValues, DangerousBaseUser, TestUserInputValues } from '@/types'
import { createCookieString } from '../createCookieString'

/**
 * For testing only
 * ToDo: fix array problem... it should return a single item, should be able to destructure it but I tried that and it didn't work...
 * ToDo: Make it return a cookie string too
 * ToDo: Add free trial option too
 */

type Output = Promise<{
	createdUser: DangerousBaseUser
	requestCookie: string
}>

/**
 * Creates a new user and cookie string for testing
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
export async function createUser(user: TestUserInputValues): Output {
	let txErrorMessage: string | undefined

	try {
		const { createdUser } = await database.transaction(async (tx) => {
			const hashedPassword = await hashPassword(user.password)
			const insertValues: BaseUserInsertValues = {
				...user,
				emailConfirmed: user.emailConfirmed ?? true, // Do not use || here!!
				slug: createMerchantSlug(user.businessName),
				hashedPassword,
			}

			txErrorMessage = 'error creating user row'
			const [createdUser] = await tx.insert(users).values(insertValues).returning()

			txErrorMessage = 'error creating acceptedDeliveryDays'
			await tx
				.insert(acceptedDeliveryDays)
				.values([monday, tuesday, wednesday, thursday, friday].map((day) => ({ userId: createdUser.id, dayOfWeekId: day })))

			txErrorMessage = undefined
			return { createdUser }
		})

		const requestCookie = createCookieString({
			userId: createdUser.id,
		})

		return { createdUser, requestCookie }
	} catch (error) {
		if (txErrorMessage) logger.error('createUser transaction error: ', txErrorMessage, error)

		logger.error(`Failed to create user for ${user.businessName}`, error)
		throw error
	}
}
