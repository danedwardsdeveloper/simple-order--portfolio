import type { AsyncFunction } from '@/types'
import { addProducts, createCookieString, createUser, deleteUser, initialiseTestGETRequestMaker } from '@tests/utilities'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import type { InventoryAdminGETresponse } from './route'

const makeRequest = initialiseTestGETRequestMaker('/inventory/admin')

describe('Get inventory', async () => {
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

	let validRequestCookie: string | undefined
	let createdUserId: number | undefined

	beforeAll(async () => {
		const { createdUser } = await createUser(lindsayLohan)
		validRequestCookie = createCookieString({ userId: createdUser.id })
		createdUserId = createdUser.id
	})

	afterAll(async () => deleteUser(lindsayLohan.email))

	describe('Cookies', () => {
		let invalidRequestCookie: undefined | string
		interface CookieCase {
			description: string
			setUp: AsyncFunction
			expectedStatus?: number
		}

		const rejectedCases: CookieCase[] = [
			{
				description: 'No cookie',
				setUp: async () => {
					invalidRequestCookie = undefined
				},
			},
			{
				description: 'Invalid cookie format',
				setUp: async () => {
					invalidRequestCookie = 'token=abc'
				},
			},
			{
				description: 'Expired cookie',
				setUp: async () => {
					if (!createdUserId) throw Error
					invalidRequestCookie = createCookieString({
						userId: createdUserId,
						expired: true,
					})
				},
			},
			{
				description: 'Invalid user',
				setUp: async () => {
					invalidRequestCookie = createCookieString({
						userId: 1,
					})
				},
				expectedStatus: 400,
			},
		]

		for (const { description, setUp, expectedStatus } of rejectedCases) {
			test(description, async () => {
				await setUp()
				const { response } = await makeRequest({ requestCookie: invalidRequestCookie })
				expect(response.status).toBe(expectedStatus || 401)
			})
		}
	})

	test('Returns 200 with valid cookie', async () => {
		const { response } = await makeRequest({ requestCookie: validRequestCookie })
		expect(response.status).toBe(200)
	})

	test('When there are no products, the only return property is developmentMessage', async () => {
		const { response } = await makeRequest({ requestCookie: validRequestCookie })
		const body = (await response.json()) as InventoryAdminGETresponse

		expect(Object.keys(response).length).toBe(1)
		expect(body.inventory).toBeUndefined()
		expect(body.developmentMessage).toBeDefined()
	})

	describe('With inventory', () => {
		let body: InventoryAdminGETresponse | undefined

		beforeAll(async () => {
			if (!createdUserId) throw new Error('createdUserId was falsy')
			await addProducts([
				{
					name: 'Sausages',
					ownerId: createdUserId,
					priceInMinorUnits: 500,
					description: '',
					customVat: 20,
				},
			])

			const { response } = await makeRequest({ requestCookie: validRequestCookie })
			body = (await response.json()) as InventoryAdminGETresponse
		})

		type InventoryCase = {
			caseDescription: string
			assertions: AsyncFunction
		}

		const inventoryCases: InventoryCase[] = [
			{
				caseDescription: "Body has 'inventory' property",
				assertions: async () => {
					expect(body).toHaveProperty('inventory')
				},
			},
			{
				caseDescription: "There's a product called 'Sausages'",
				assertions: async () => {
					expect(body?.inventory?.[0]?.name).toEqual('Sausages')
				},
			},
		]

		for (const { caseDescription, assertions } of inventoryCases) {
			test(caseDescription, async () => await assertions())
		}
	})
})

/* 
pnpm vitest src/app/api/inventory/admin/GET
*/
