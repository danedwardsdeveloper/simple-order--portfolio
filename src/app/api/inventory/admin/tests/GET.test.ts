import { deleteUserSequence } from '@/library/database/operations'
import { createCookieString, createUser, initialiseGETRequestMaker } from '@tests/utilities'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

const makeRequest = initialiseGETRequestMaker('/inventory/admin')

interface Case {
	description: string
	requestCookie: string | undefined
}

describe('API > Inventory > Admin > GET', async () => {
	describe('Cookies', () => {
		const rejectedCases: Case[] = [
			{
				description: 'No cookie',
				requestCookie: undefined,
			},
			{
				description: 'Invalid cookie format',
				requestCookie: 'invalidCookie=abc',
			},
			{
				description: 'Correct format, invalid content',
				requestCookie: 'invalidCookie=ToDo',
			},
			{
				description: 'Expired cookie',
				requestCookie: 'expiredCookie=ToDo',
			},
		]

		for (const { description, requestCookie } of rejectedCases) {
			test(description, async () => {
				const { response } = await makeRequest(requestCookie)
				expect(response.status).toBe(401)
			})
		}

		describe('Success cases', () => {
			const lindsayLohan = {
				firstName: 'Lindsay',
				lastName: 'Lohan',
				email: 'lindsaylohan@gmail.com',
				slug: `lindsay's-bakery`,
				password: 'lindsay123',
				businessName: `Lindsay's Bakery`,
				emailConfirmed: true,
				cachedTrialExpired: false,
			}
			let validRequestCookie: string | undefined = undefined

			beforeAll(async () => {
				const { createdUser } = await createUser(lindsayLohan)
				validRequestCookie = createCookieString({ userId: createdUser.id })
			})

			afterAll(async () => deleteUserSequence(lindsayLohan.email))

			test('Returns 200 with valid cookie', async () => {
				const { response } = await makeRequest(validRequestCookie)
				expect(response.status).toBe(200)
			})

			test('Returns empty object when there are no products', async () => {
				const { response } = await makeRequest(validRequestCookie)
				const data = await response.json()
				expect(data).toMatchObject({})
			})
		})
	})
})

/* 
pnpm vitest src/app/api/inventory/admin/tests/GET
*/

/*
ACCEPTED
- Email confirmed
- Email not confirmed
- Does not return an empty array when there are no products
*/
