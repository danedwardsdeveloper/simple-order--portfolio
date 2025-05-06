import { http403forbidden } from '@/library/constants'
import { createFreeTrial } from '@/library/database/operations'
import type { TestUserInputValues } from '@/types'
import { addProducts, createUser, deleteUser, initialiseTestRequestMaker } from '@tests/utilities'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

const makeRequest = initialiseTestRequestMaker({
	basePath: '/inventory',
	method: 'DELETE',
})

describe('Delete inventory item', () => {
	const anneShirleyInputValues: TestUserInputValues = {
		firstName: 'Anne',
		lastName: 'Shirley',
		businessName: 'Green Gables Farm',
		email: 'anne@greengables.com',
		// cspell:disable-next-line
		password: 'l@keofsh!iningWat3r$',
	}

	let validItemId: undefined | number
	let validRequestCookie: undefined | string

	beforeAll(async () => {
		await deleteUser(anneShirleyInputValues.email)

		const { createdUser, requestCookie: createdRequestCookie } = await createUser(anneShirleyInputValues)
		validRequestCookie = createdRequestCookie

		await createFreeTrial({ userId: createdUser.id })

		const addedProducts = await addProducts([
			{
				name: 'Raspberry cordial',
				ownerId: createdUser.id,
				priceInMinorUnits: 500,
			},
		])

		validItemId = addedProducts[0].id
	})

	afterAll(async () => await deleteUser(anneShirleyInputValues.email))

	describe('Invalid cookies', () => {
		interface InvalidCookieCase {
			description: string
			requestCookie: string | undefined
		}

		const invalidCookies: InvalidCookieCase[] = [
			{
				description: 'No cookie',
				requestCookie: undefined,
			},
			{
				description: 'Invalid cookie format',
				requestCookie: 'token=abc',
			},
		]

		for (const { description, requestCookie } of invalidCookies) {
			test(description, async () => {
				if (!validItemId) throw new Error('Item ID not valid')

				const { response } = await makeRequest({
					requestCookie,
					segment: validItemId,
				})

				expect(response.status).toEqual(401)
			})
		}
	})

	describe('Valid cookies', () => {
		interface ValidCookieCase {
			description: string
			expectedStatus: number
			useInvalidItemId?: boolean
		}

		const cases: ValidCookieCase[] = [
			{
				description: 'Valid request',
				expectedStatus: 200,
			},
			{
				description: "Try to delete someone else's item",
				useInvalidItemId: true,
				expectedStatus: http403forbidden,
			},
		]

		for (const { description, useInvalidItemId, expectedStatus } of cases) {
			test(description, async () => {
				if (!validItemId) throw new Error('Item ID not valid')
				if (!validRequestCookie) throw new Error('Request cookie not valid')

				const { response } = await makeRequest({
					requestCookie: validRequestCookie,
					segment: useInvalidItemId ? validItemId + 1 : validItemId,
				})

				expect(response.status).toEqual(expectedStatus)
			})
		}
	})
})

/* 
			pnpm vitest src/app/api/inventory/\[itemId\]
*/
