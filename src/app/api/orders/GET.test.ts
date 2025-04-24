import type { AsyncFunction, TestUserInputValues } from '@/types'
import { createCookieString, createUser, deleteUser, initialiseTestGETRequestMaker } from '@tests/utilities'
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest'

const melissaJoanHartInputValues: TestUserInputValues = {
	firstName: 'Melissa',
	lastName: 'Joan Hart',
	businessName: 'Melissa Joan Enterprises',
	email: 'melissa@joanhart.com',
	password: 'Sabr1n@!Witch',
}

const biancaDelRioInputValues: TestUserInputValues = {
	firstName: 'Bianca',
	lastName: 'Del Rio',
	businessName: 'Bianca Del Rio Fashion',
	email: 'bianca@delrio.com',
	password: 'N0tT0day$atan',
}

/*
- Create a user
- Create some products
- Run the tests up to the empty success case

- Create another user
- Create an order
- Run the success case with an order
*/

describe('GET /api/orders', () => {
	const makeRequest = initialiseTestGETRequestMaker('/orders')

	type CookieCases = {
		caseDescription: string
		caseRequestCookie: string | undefined
	}

	const cookieCases: CookieCases[] = [
		{
			caseDescription: 'Expired token',
			caseRequestCookie: createCookieString({ userId: 1, expired: true }),
		},
		{
			caseDescription: 'Invalid token',
			caseRequestCookie: 'token=abc',
		},
		{
			caseDescription: 'User not found',
			caseRequestCookie: createCookieString({ userId: 1 }),
		},
	]

	for (const { caseDescription, caseRequestCookie } of cookieCases) {
		test(caseDescription, async () => {
			const { response } = await makeRequest({
				requestCookie: caseRequestCookie,
			})
			expect(response.status).toBe(400)
		})
	}

	describe('Success', () => {
		let melissaCookie: string | undefined

		afterEach(async () => await deleteUser(melissaJoanHartInputValues.email))

		type NoContentCase = {
			caseDescription: string
			userInputValues?: TestUserInputValues
			setUp?: AsyncFunction
			skip?: boolean
		}

		describe('No content', () => {
			const successNoContentCases: NoContentCase[] = [
				{
					caseDescription: 'Success with active subscription',
					skip: true,
				},
				{
					caseDescription: 'Success without active subscription',
					skip: true,
				},
				{
					caseDescription: 'Success with active trial',
					skip: true,
				},
				{
					caseDescription: 'Success without active trial',
					skip: true,
				},
				{ caseDescription: 'Success with no orders returns nothing at all ' },
				{
					caseDescription: 'Allows confirmed emails',
					userInputValues: {
						...melissaJoanHartInputValues,
						emailConfirmed: true,
					},
				},
				{
					caseDescription: 'Allows unconfirmed emails',
					userInputValues: {
						...melissaJoanHartInputValues,
						emailConfirmed: false,
					},
				},
			]

			for (const { caseDescription, setUp, userInputValues, skip } of successNoContentCases) {
				test.skipIf(skip)(caseDescription, async () => {
					if (setUp) await setUp()
					const { requestCookie } = await createUser(userInputValues || melissaJoanHartInputValues)
					melissaCookie = requestCookie

					const { response } = await makeRequest({
						requestCookie: melissaCookie,
					})
					expect(response.status).toBe(200)
					expect(Object.keys(response).length).toBe(1)

					const body = await response.json()
					expect(body).toHaveProperty('developmentMessage')
				})
			}
		})

		describe('With content', () => {
			let _biancaCookie: string | undefined

			beforeAll(async () => {
				const { requestCookie: createdMelissaCookie } = await createUser(melissaJoanHartInputValues)
				melissaCookie = createdMelissaCookie

				const { requestCookie: createdBiancaCookie } = await createUser(biancaDelRioInputValues)
				_biancaCookie = createdBiancaCookie
			})

			afterAll(async () => await deleteUser(biancaDelRioInputValues.email))

			type SuccessWithContentCase = {
				skip?: boolean
				caseDescription: string
				setUp?: AsyncFunction
				expectedBody?: { ordersMade: '' }
			}

			const successWithContentCases: SuccessWithContentCase[] = [
				{
					skip: true,
					caseDescription: 'Success with content',
					setUp: async () => {
						// Add a product
						// Make an order
					},
				},
				{
					skip: true,
					caseDescription: 'Success with customer notes',
					setUp: async () => {
						// Make an order with a customer note
					},
				},
				{
					skip: true,
					caseDescription: 'Success with lots of orders',
					setUp: async () => {
						// Make more orders
					},
				},
			]

			for (const { skip, caseDescription, setUp } of successWithContentCases) {
				test.skipIf(skip)(caseDescription, async () => {
					if (setUp) await setUp()

					const { response } = await makeRequest({
						requestCookie: melissaCookie,
					})

					//
					expect(response.status).toBe(200)
					expect(Object.keys(response).length).toBe(1)

					const body = await response.json()
					expect(body).toHaveProperty('developmentMessage')
				})
			}
		})
	})
})

/*
pnpm vitest src/app/api/orders/GET
*/
