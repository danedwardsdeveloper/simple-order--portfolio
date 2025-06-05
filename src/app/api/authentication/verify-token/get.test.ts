import { createFreeTrial, deleteFreeTrial } from '@/library/database/operations'
import type { AsyncFunction, DangerousBaseUser, JsonData } from '@/types'
import type { TestUserInputValues } from '@/types'
import { createCookieString, initialiseTestGETRequestMaker } from '@tests/utilities'
import { createTestUser, deleteUser } from '@tests/utilities'
import { afterEach, beforeEach } from 'vitest'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

const makeRequest = initialiseTestGETRequestMaker('/authentication/verify-token')

const stanSmithInputValues: TestUserInputValues = {
	firstName: 'Stan',
	lastName: 'Smith',
	businessName: 'CIA',
	email: 'stansmith@gmail.com',
	password: '123456789',
	emailConfirmed: true,
}

let stanSmith: DangerousBaseUser
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

type Case = {
	caseDescription: string
	caseSetUp?: AsyncFunction
	caseCookie: (() => string) | string | null
	skip?: boolean
	assertions?: AsyncFunction
	caseExpectedStatus?: number
	caseTearDown?: AsyncFunction
}

beforeAll(async () => {
	const { createdUser, validCookie: createdCookie } = await createTestUser(stanSmithInputValues)
	stanSmith = createdUser
	validCookie = createdCookie
})

afterAll(async () => {
	await deleteUser(stanSmithInputValues.email)
})

const suites: TestSuite[] = [
	{
		suiteDescription: 'Authentication',
		suiteBeforeAll: async () => {
			await createFreeTrial({ userId: stanSmith.id })
		},
		suiteExpectedStatus: 400,
		cases: [
			{
				caseDescription: 'No cookie',
				caseCookie: null,
				caseExpectedStatus: 200, // Brand new site visitors
			},
			{
				caseDescription: 'Invalid cookie',
				caseCookie: 'token=abcdefg',
			},
			{
				caseDescription: 'Expired cookie',
				caseCookie: createCookieString({ userId: 1, expired: true }),
			},
			{
				caseDescription: 'User not found',
				caseCookie: createCookieString({ userId: 1 }),
			},
			{
				caseDescription: 'No trial or subscription',
				caseSetUp: async () => {
					await deleteFreeTrial(stanSmith.id)
				},
				caseCookie: () => validCookie,
				caseExpectedStatus: 200,
			},
			{
				caseDescription: 'Success case',
				caseCookie: () => validCookie,
				caseExpectedStatus: 200,
				assertions: async () => {
					expect(jsonData.ok).toBe(true)
					expect(jsonData.user).toBeDefined()
					expect(jsonData.inventory).toBeDefined()
				},
			},
		],
	},
]

describe('verify-token', async () => {
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

			for (const { caseDescription, caseSetUp, caseCookie, skip, assertions, caseExpectedStatus, caseTearDown } of cases)
				test.skipIf(skip)(caseDescription, async () => {
					if (caseSetUp) await caseSetUp()

					const resolvedCookie = caseCookie === null ? undefined : typeof caseCookie === 'function' ? caseCookie() : caseCookie

					const data = await makeRequest({
						requestCookie: resolvedCookie,
					})

					jsonData = (await data.response.json()) as JsonData

					if (assertions) await assertions()

					expect(data.response.status).toEqual(caseExpectedStatus || suiteExpectedStatus)

					if (caseTearDown) await caseTearDown()
				})
		})
	}
})

/* 
pnpm vitest src/app/api/authentication/verify-token/get
*/
