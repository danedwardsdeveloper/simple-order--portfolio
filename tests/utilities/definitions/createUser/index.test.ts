import { database } from '@/library/database/connection'
import { freeTrials, users } from '@/library/database/schema'
import { equals } from '@/library/utilities/server'
import type { DangerousBaseUser, FreeTrial, TestUserInputValues } from '@/types'
import { apiTestRequest, deleteUser } from '@tests/utilities'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { createUser } from '.'

const emilyGilmore: TestUserInputValues = {
	firstName: 'Emily',
	lastName: 'Gilmore',
	businessName: 'Emily Gilmore Enterprises',
	email: 'emilygilmore@gmail.com',
	emailConfirmed: true,
	cachedTrialExpired: false,
	password: 'securePassword123',
}

describe('Create user', () => {
	describe('Creates a user with the right shape', () => {
		let user: DangerousBaseUser | undefined
		let trial: FreeTrial | undefined
		let cookie: string | undefined

		beforeAll(async () => {
			const { createdUser, freeTrial, requestCookie } = await createUser(emilyGilmore)
			user = createdUser
			trial = freeTrial
			cookie = requestCookie
		})

		afterAll(async () => {
			await deleteUser(emilyGilmore.email)
		})

		test('Creates a user', async () => {
			if (!user) throw new Error('User not defined')
			const [foundUser] = await database.select().from(users).where(equals(users.id, user.id)).limit(1)
			expect(foundUser).toBeDefined()
		})

		test('Creates a trial', async () => {
			if (!user) throw new Error('User not defined')
			if (!trial) throw new Error('Free trial not defined')
			const [foundTrial] = await database.select().from(freeTrials).where(equals(freeTrials.userId, user.id)).limit(1)
			expect(foundTrial).toBeDefined()
		})

		test('Cookie exists', () => {
			expect(cookie).toBeDefined()
		})

		test('Cookie can be used to make a request to /authentication/verify-token', async () => {
			const response = await apiTestRequest({
				basePath: 'authentication/verify-token',
				requestCookie: cookie,
			})
			expect(response.status).toBe(200)
		})
	})
})

/* 
pnpm vitest tests/utilities/definitions/createUser
*/
