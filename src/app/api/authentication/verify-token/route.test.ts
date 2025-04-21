import { cookieDurations } from '@/library/constants'
import { database } from '@/library/database/connection'
import { deleteUserSequence } from '@/library/database/operations'
import { users } from '@/library/database/schema'
import { createCookieWithToken } from '@/library/utilities/server'
import { initialiseGETRequestMaker } from '@tests/utilities'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

const requestMaker = initialiseGETRequestMaker({
	path: '/authentication/verify-token',
})

const badCookie = '123456789'
let validCookie: undefined | string = undefined

describe('Verify token', () => {
	beforeAll(async () => {
		const [stanSmith] = await database
			.insert(users)
			.values({
				firstName: 'Stan',
				lastName: 'Smith',
				businessName: 'CIA',
				slug: 'cia',
				email: 'stansmith@gmail.com',
				hashedPassword: '123456789',
			})
			.returning()

		const cookieOptions = createCookieWithToken(stanSmith.id, cookieDurations.oneYear)
		validCookie = `${cookieOptions.name}=${cookieOptions.value}`
	})

	afterAll(async () => {
		await deleteUserSequence('stansmith@gmail.com')
	})

	test('Invalid token', async () => {
		const { response } = await requestMaker(badCookie)
		expect(response.status).toBe(400)
	})

	test('Valid token', async () => {
		const { response } = await requestMaker(validCookie)
		expect(response.status).toBe(200)
	})
})

/*
pnpm vitest src/app/api/authentication/verify-token
*/
