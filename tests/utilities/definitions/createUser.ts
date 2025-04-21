import { database } from '@/library/database/connection'
import { users } from '@/library/database/schema'
import { hashPassword } from '@/library/utilities/server'
import type { BaseUserInsertValues, TestUserInputValues } from '@/types'

/**
 * For testing only
 * ToDo: fix array problem... it should return a single item, should be able to destructure it but I tried that and it didn't work...
 * ToDo: Make it return a cookie string too
 * ToDo: Add free trial option too
 */
export async function createUser(user: TestUserInputValues) {
	const hashedPassword = await hashPassword(user.password)
	const insertValues: BaseUserInsertValues = {
		...user,
		hashedPassword,
	}
	const [createdUser] = await database.insert(users).values(insertValues).returning()
	return { createdUser }
}

/*
	const freeTrailInsertValues: NewFreeTrial = {
			userId: createdUser.id,
			startDate: new Date(),
			endDate: createFreeTrialEndTime(),
		}

		await database.insert(freeTrials).values(freeTrailInsertValues)

*/
