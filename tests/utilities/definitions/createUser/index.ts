import { database } from '@/library/database/connection'
import { freeTrials, users } from '@/library/database/schema'
import { createFreeTrialEndTime } from '@/library/utilities/public'
import { hashPassword } from '@/library/utilities/server'
import type { BaseUserInsertValues, DangerousBaseUser, FreeTrial, TestUserInputValues } from '@/types'
import slugify from 'slugify'
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
	freeTrial: FreeTrial
}>

/**
 * Creates a new user, cookie string and free trial for testing
 * @example
const { createdUser, requestCookie, freeTrial } = await createUser({
	firstName: 'Emily',
	lastName: 'Gilmore',
	businessName: 'Emily Gilmore Enterprises',
	email: 'emilygilmore@gmail.com',
	emailConfirmed: true,
	cachedTrialExpired: false,
	password: 'securePassword123',
})
 */
export async function createUser(user: TestUserInputValues): Output {
	const hashedPassword = await hashPassword(user.password)
	const insertValues: BaseUserInsertValues = {
		...user,
		emailConfirmed: user.emailConfirmed || true,
		cachedTrialExpired: false,
		slug: slugify(user.businessName),
		hashedPassword,
	}
	const [createdUser] = await database.insert(users).values(insertValues).returning()

	const requestCookie = createCookieString({
		userId: createdUser.id,
	})

	const [freeTrial] = await database
		.insert(freeTrials)
		.values({ userId: createdUser.id, startDate: new Date(), endDate: createFreeTrialEndTime() })
		.returning()

	return { createdUser, requestCookie, freeTrial }
}
