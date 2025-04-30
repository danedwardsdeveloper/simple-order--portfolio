import { http409conflict } from '@/library/constants'
import { createFreeTrial } from '@/library/database/operations'
import type { AnonymousProduct, AsyncFunction, DangerousBaseUser, JsonData, TestUserInputValues } from '@/types'
import { addProducts, createCookieString, createUser, deleteUser, initialiseTestRequestMaker } from '@tests/utilities'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest'

const makeRequest = initialiseTestRequestMaker({
	basePath: '/inventory/admin',
	method: 'POST',
})

const invalidRequestCookie = 'token=abcdefg'
const userNotFoundCookie = createCookieString({ userId: 1 })
const expiredRequestCookie = createCookieString({ userId: 1, expired: true })
const elizabethBennetInputValues: TestUserInputValues = {
	firstName: 'Elizabeth',
	lastName: 'Bennet',
	businessName: 'Longbourn Estate',
	email: 'lizzie@longbourn.com',
	password: 'PrideN0tPr3judice',
	emailConfirmed: true,
}
const strawberryJam: AnonymousProduct = {
	name: 'Strawberry jam',
	priceInMinorUnits: 213,
	description: 'A delicious homemade conserve made',
	customVat: 15,
}

function getElizabethBennet(): DangerousBaseUser {
	if (!elizabethBennet) throw new Error('Elizabeth Bennet not defined')
	return elizabethBennet
}

function getJsonData(): JsonData {
	if (!jsonData) throw new Error('jsonData not defined')
	return jsonData
}

let elizabethBennet: DangerousBaseUser | undefined
let validRequestCookie: string | undefined
let jsonData: JsonData | undefined

type Suite = {
	suiteDescription: string
	suiteSetUp?: AsyncFunction
	suiteBeforeEach?: AsyncFunction
	suiteAfterEach?: AsyncFunction
	suiteTearDown?: AsyncFunction
	suiteExpectedStatus: number
	cases: Case[]
}

type RuntimeString = () => string | undefined

type Case = {
	caseDescription: string
	caseSetUp?: AsyncFunction
	requestCookie?: string | null | RuntimeString
	requestBody?: JsonData | null
	assertions?: AsyncFunction
	caseExpectedStatus?: number
	caseTearDown?: AsyncFunction
}

const suites: Suite[] = [
	{
		suiteDescription: 'Permissions',
		suiteExpectedStatus: 400,
		cases: [
			{
				caseDescription: 'No cookie',
				requestCookie: null,
				requestBody: strawberryJam,
			},
			{
				caseDescription: 'Valid cookie, no body',
				requestCookie: () => validRequestCookie,
				requestBody: strawberryJam,
			},
			{
				caseDescription: 'Invalid cookie',
				requestCookie: invalidRequestCookie,
				requestBody: strawberryJam,
			},
			{
				caseDescription: 'Expired cookie',
				requestCookie: expiredRequestCookie,
			},
			{
				caseDescription: 'User not found',
				requestCookie: userNotFoundCookie,
				requestBody: strawberryJam,
				assertions: async () => {
					expect(getJsonData()).toEqual({ developmentMessage: 'user not found' })
				},
			},
			{
				caseDescription: 'Valid cookie, valid body, email confirmed, no trial or subscription',
				requestCookie: () => validRequestCookie,
				requestBody: strawberryJam,
				caseExpectedStatus: 403,
			},
			{
				caseDescription: 'Valid cookie, valid body, email confirmed, in-date trial',
				caseSetUp: async () => {
					await createFreeTrial({ userId: getElizabethBennet().id })
				},
				requestCookie: () => validRequestCookie,
				requestBody: strawberryJam,
				caseExpectedStatus: 201,
			},
		],
	},
	{
		suiteDescription: 'Rejected with valid credentials & access',
		suiteExpectedStatus: 400,
		suiteSetUp: async () => {
			await deleteUser(elizabethBennetInputValues.email)
		},
		suiteBeforeEach: async () => {
			const { createdUser, requestCookie } = await createUser(elizabethBennetInputValues)
			elizabethBennet = createdUser
			validRequestCookie = requestCookie

			await createFreeTrial({ userId: createdUser.id })
		},
		suiteAfterEach: async () => {
			await deleteUser(elizabethBennetInputValues.email)
		},
		cases: [
			{
				caseDescription: 'Rejects the 101th product',
				caseSetUp: async () => {
					const { id } = getElizabethBennet()

					const oneHundredJams = Array.from({ length: 100 }, (_, i) => ({
						...strawberryJam,
						name: `Strawberry Jam ${i + 1}`,
						ownerId: id,
					}))

					await addProducts(oneHundredJams)
				},
				requestCookie: () => validRequestCookie,
				requestBody: strawberryJam,
				caseExpectedStatus: 403,
				assertions: async () => {
					expect(getJsonData()).toEqual({ developmentMessage: 'too many products' })
				},
			},
			{
				caseDescription: 'Reject a product with a duplicated name',
				caseSetUp: async () => {
					await addProducts([{ ...strawberryJam, ownerId: getElizabethBennet().id }])
				},
				requestCookie: () => validRequestCookie,
				requestBody: strawberryJam,
				caseExpectedStatus: http409conflict,
			},
		],
	},
]

describe('POST /api/inventory/admin', async () => {
	beforeAll(async () => {
		const { createdUser, requestCookie } = await createUser(elizabethBennetInputValues)
		elizabethBennet = createdUser
		validRequestCookie = requestCookie
	})

	afterAll(async () => {
		await deleteUser(elizabethBennetInputValues.email)
	})

	for (const { suiteDescription, suiteSetUp, suiteBeforeEach, suiteExpectedStatus, suiteAfterEach, suiteTearDown, cases } of suites) {
		describe(suiteDescription, async () => {
			beforeAll(async () => {
				if (suiteSetUp) await suiteSetUp()
			})

			beforeEach(async () => {
				if (suiteBeforeEach) await suiteBeforeEach()
			})

			afterEach(async () => {
				if (suiteAfterEach) await suiteAfterEach()
			})

			afterAll(async () => {
				if (suiteTearDown) await suiteTearDown()
			})

			for (const { caseDescription, caseSetUp, requestCookie, requestBody, assertions, caseExpectedStatus, caseTearDown } of cases) {
				test(caseDescription, async () => {
					if (caseSetUp) await caseSetUp()

					getElizabethBennet()
					if (!validRequestCookie) throw new Error('Valid request cookie not defined')

					const resolvedCookie =
						requestCookie === null
							? undefined //
							: typeof requestCookie === 'function'
								? requestCookie() //
								: requestCookie

					const data = await makeRequest({ requestCookie: resolvedCookie, body: requestBody })

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
pnpm vitest src/app/api/inventory/admin/POST
*/
