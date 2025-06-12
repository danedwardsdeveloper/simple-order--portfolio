import { http409conflict } from '@/library/constants'
import { database } from '@/library/database/connection'
import { createFreeTrial, deleteFreeTrial } from '@/library/database/operations'
import { products } from '@/library/database/schema'
import { equals } from '@/library/utilities/server'
import type { AsyncFunction, DangerousBaseUser, JsonData, TestUserInputValues } from '@/types'
import { strawberryJam } from '@tests/constants'
import { addProducts, createCookieString, createTestUser, deleteUser, initialiseTestRequestMaker } from '@tests/utilities'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest'

// ToDo: Add a product, then delete it, then try to add it again. Previously has made a conflict...

// Suite/Case test snippet in progress - most comprehensive

const makeRequest = initialiseTestRequestMaker({
	basePath: '/inventory',
	method: 'POST',
})

const invalidRequestCookie = 'token=abcdefg'
const expiredRequestCookie = createCookieString({ userId: 1, expired: true })
const elizabethBennetInputValues: TestUserInputValues = {
	firstName: 'Elizabeth',
	lastName: 'Bennet',
	businessName: 'Longbourn Estate',
	email: 'lizzie@longbourn.com',
	password: 'PrideN0tPr3judice',
	emailConfirmed: true,
}

function assertElizabethBennet(): DangerousBaseUser {
	if (!elizabethBennet) throw new Error('Elizabeth Bennet not defined')
	return elizabethBennet
}

function getJsonData(): JsonData {
	if (!jsonData) throw new Error('jsonData not defined')
	return jsonData
}

let elizabethBennet: DangerousBaseUser
let validCookie: string
let jsonData: JsonData

type TestSuite = {
	suiteDescription: string
	suiteBeforeAll?: AsyncFunction
	suiteBeforeEach?: AsyncFunction
	suiteAfterEach?: AsyncFunction
	suiteAfterAll?: AsyncFunction
	suiteExpectedStatus: number
	cases: Case[]
}

type ApiTestRequestParameters = {
	cookie: (() => string | undefined) | string | null
	body: (() => JsonData) | JsonData | null
}

type Case = {
	caseDescription: string
	caseSetUp?: AsyncFunction
	request: ApiTestRequestParameters
	skip?: boolean
	assertions?: AsyncFunction
	caseExpectedStatus?: number
	caseTearDown?: AsyncFunction
}

const validRequest = {
	cookie: () => validCookie,
	body: () => ({ ...strawberryJam, ownerId: assertElizabethBennet().id }),
}

const suites: TestSuite[] = [
	{
		suiteDescription: 'Permissions',
		suiteBeforeAll: async () => {
			const { createdUser, validCookie: createdCookie } = await createTestUser(elizabethBennetInputValues)
			elizabethBennet = createdUser
			validCookie = createdCookie
			await createFreeTrial({ userId: elizabethBennet.id })
		},
		suiteAfterAll: async () => {
			await deleteUser(elizabethBennetInputValues.email)
		},
		suiteExpectedStatus: 401,
		cases: [
			{
				caseDescription: 'No cookie',
				request: { ...validRequest, cookie: null },
			},
			{
				caseDescription: 'No body',
				request: { ...validRequest, body: null },
				caseExpectedStatus: 400,
			},
			{
				caseDescription: 'Empty body',
				request: { ...validRequest, body: {} },
				caseExpectedStatus: 400,
			},
			{
				caseDescription: 'Invalid cookie',
				request: { ...validRequest, cookie: invalidRequestCookie },
			},
			{
				caseDescription: 'Expired cookie',
				request: { ...validRequest, cookie: expiredRequestCookie },
			},
			{
				caseDescription: 'User not found',
				request: {
					body: { ...strawberryJam, ownerId: 1 },
					cookie: createCookieString({ userId: 1 }),
				},
				assertions: async () => {
					expect(getJsonData()).toEqual({ developmentMessage: 'user not found' })
				},
			},
			{
				caseDescription: 'No trial or subscription',
				caseSetUp: async () => {
					await deleteFreeTrial(assertElizabethBennet().id)
				},
				request: validRequest,
				caseExpectedStatus: 403,
				caseTearDown: async () => {
					await createFreeTrial({ userId: assertElizabethBennet().id })
				},
			},
			{
				caseDescription: 'Product with duplicate name',
				caseSetUp: async () => {
					await addProducts([{ ...strawberryJam, ownerId: assertElizabethBennet().id }])
				},
				request: validRequest,
				caseExpectedStatus: http409conflict,
				caseTearDown: async () => {
					await database.delete(products).where(equals(products.ownerId, assertElizabethBennet().id))
				},
			},
			{
				caseDescription: 'Success case',
				request: validRequest,
				caseExpectedStatus: 201,
			},
		],
	},
	{
		suiteDescription: 'Body validations',
		suiteExpectedStatus: 400,
		suiteBeforeAll: async () => {
			const { createdUser, validCookie: createdCookie } = await createTestUser(elizabethBennetInputValues)
			elizabethBennet = createdUser
			validCookie = createdCookie
			await createFreeTrial({ userId: elizabethBennet.id })
		},
		suiteAfterAll: async () => {
			await deleteUser(elizabethBennetInputValues.email)
		},
		cases: [
			{
				caseDescription: 'Missing name',
				request: {
					...validRequest,
					body: { ...strawberryJam, name: undefined },
				},
			},
			{
				caseDescription: 'Name is empty string',
				request: {
					...validRequest,
					body: { ...strawberryJam, name: '' },
				},
			},
			{
				caseDescription: 'Missing price',
				request: {
					...validRequest,
					body: { ...strawberryJam, priceInMinorUnits: undefined },
				},
			},
		],
	},
	{
		suiteDescription: 'Business constraints',
		suiteExpectedStatus: 400,
		suiteBeforeAll: async () => {
			await deleteUser(elizabethBennetInputValues.email)
			// For now just delete the entire user and start fresh. In the future I'll make a deleteProducts function but this has to delete orderItems too, and is complex
			const { createdUser, validCookie: createdCookie } = await createTestUser(elizabethBennetInputValues)
			elizabethBennet = createdUser
			validCookie = createdCookie

			await createFreeTrial({ userId: createdUser.id })
		},
		suiteAfterAll: async () => {
			await deleteUser(elizabethBennetInputValues.email)
		},
		cases: [
			{
				caseDescription: 'Rejects the 101th product',
				caseSetUp: async () => {
					const { id } = assertElizabethBennet()

					const oneHundredJams = Array.from({ length: 100 }, (_, i) => ({
						...strawberryJam,
						name: `Strawberry Jam ${i + 1}`,
						ownerId: id,
					}))

					await addProducts(oneHundredJams)
				},
				request: validRequest,
				caseExpectedStatus: 403,
				assertions: async () => {
					expect(getJsonData()).toEqual({ developmentMessage: 'too many products' })
				},
			},
		],
	},
]

describe('POST /api/inventory', async () => {
	for (const { suiteDescription, suiteBeforeAll, suiteBeforeEach, suiteAfterEach, suiteAfterAll, suiteExpectedStatus, cases } of suites) {
		describe(suiteDescription, async () => {
			beforeAll(async () => {
				if (suiteBeforeAll) await suiteBeforeAll()
			})

			beforeEach(async () => {
				if (suiteBeforeEach) await suiteBeforeEach()
			})

			afterEach(async () => {
				if (suiteAfterEach) await suiteAfterEach()
			})

			afterAll(async () => {
				if (suiteAfterAll) await suiteAfterAll()
			})

			for (const {
				caseDescription,
				caseSetUp,
				request: { body, cookie },
				skip,
				assertions,
				caseExpectedStatus,
				caseTearDown,
			} of cases) {
				test.skipIf(skip)(caseDescription, async () => {
					if (caseSetUp) await caseSetUp()

					const resolvedCookie = cookie === null ? undefined : typeof cookie === 'function' ? cookie() : cookie

					const resolvedBody = body === null ? undefined : typeof body === 'function' ? body() : body

					const data = await makeRequest({
						requestCookie: resolvedCookie, //
						body: resolvedBody,
					})

					jsonData = (await data.response.json()) as JsonData

					if (assertions) await assertions()

					expect(data.response.status).toEqual(caseExpectedStatus || suiteExpectedStatus)

					if (caseTearDown) await caseTearDown()
				})
			}
		})
	}
})

/* 
pnpm vitest src/app/api/inventory/POST
*/
