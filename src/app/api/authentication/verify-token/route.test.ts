import type { TestUserInputValues } from '@/types'
import { createUser, deleteUser, initialiseTestGETRequestMaker } from '@tests/utilities'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

const makeRequest = initialiseTestGETRequestMaker('/authentication/verify-token')

describe('Verify token', () => {
	const stanSmith: TestUserInputValues = {
		firstName: 'Stan',
		lastName: 'Smith',
		businessName: 'CIA',
		email: 'stansmith@gmail.com',
		password: '123456789',
		emailConfirmed: true,
	}
	const invalidCookie = 'token=123456789'
	let validCookie: undefined | string

	beforeAll(async () => {
		const { requestCookie } = await createUser(stanSmith)
		validCookie = requestCookie
	})

	afterAll(async () => {
		await deleteUser(stanSmith.email)
	})

	test('Invalid token', async () => {
		const { response } = await makeRequest({ requestCookie: invalidCookie })
		expect(response.status).toBe(400)
	})

	test('No token at all returns 200', async () => {
		const { response } = await makeRequest({ requestCookie: undefined })
		expect(response.status).toBe(200)
	})

	test('Valid token', async () => {
		if (!validCookie) throw new Error('Failed to create valid cookie')
		const { response } = await makeRequest({ requestCookie: validCookie })
		expect(response.status).toBe(200)
	})

	test.skip('Make more comprehensive', () => {
		//
	})
})

/*
pnpm vitest src/app/api/authentication/verify-token
*/
