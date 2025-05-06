import { database } from '@/library/database/connection'
import { createFreeTrial, deleteFreeTrial } from '@/library/database/operations'
import { users } from '@/library/database/schema'
import { equals } from '@/library/utilities/server'
import type { AsyncFunction, DangerousBaseUser, TestUserInputValues } from '@/types'
import type { JsonData } from '@tests/types'
import { createCookieString, createUser, deleteUser, initialiseTestRequestMaker } from '@tests/utilities'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import type { SettingsPATCHbody } from './route'

const makeRequest = initialiseTestRequestMaker({
	basePath: '/settings',
	method: 'PATCH',
})

const invalidRequestCookie = 'token=abcdefg'
const expiredRequestCookie = createCookieString({ userId: 1, expired: true })
const userInputValues: TestUserInputValues = {
	firstName: 'Jo',
	lastName: 'March',
	businessName: 'March Writers',
	email: 'jo@march.com',
	password: 'L1ttleW0men!',
}

function getJoMarch(): DangerousBaseUser {
	if (!joMarch) throw new Error('Jo March not defined')
	return joMarch
}

function getJsonData(): JsonData {
	if (!jsonData) throw new Error('jsonData not defined')
	return jsonData
}

let joMarch: DangerousBaseUser | undefined
let validRequestCookie: string | undefined
let jsonData: JsonData | undefined

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

const cutOffTime = new Date()
cutOffTime.setUTCHours(14, 30, 0, 0)

const tenPM = new Date()
tenPM.setUTCHours(22, 0, 0, 0)

const validBody: SettingsPATCHbody = {
	cutOffTime,
	leadTimeDays: 1,
}

const validRequest = {
	cookie: () => validRequestCookie,
	body: () => validBody,
}

const suites: TestSuite[] = [
	{
		suiteDescription: 'Permissions',

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
					body: validBody,
					cookie: createCookieString({ userId: 1 }),
				},
				assertions: async () => {
					expect(getJsonData()).toEqual({ developmentMessage: 'user not found' })
				},
			},
			{
				caseDescription: 'Success without a trial',
				caseSetUp: async () => {
					await deleteFreeTrial(getJoMarch().id)
				},
				request: validRequest,
				caseExpectedStatus: 200,
				caseTearDown: async () => {
					await createFreeTrial({ userId: getJoMarch().id })
				},
			},
			{
				caseDescription: 'Success with a trial',
				request: validRequest,
				caseExpectedStatus: 200,
			},
			// Success with a subscription
		],
	},
	{
		suiteDescription: 'Body validations',
		suiteExpectedStatus: 400,

		cases: [
			{
				caseDescription: 'leadTimeDays is negative',
				request: {
					...validRequest,
					body: { ...validBody, leadTimeDays: -1 },
				},
			},
			{
				caseDescription: 'leadTimeDays is a fraction',
				request: {
					...validRequest,
					body: { ...validBody, leadTimeDays: 1.5 },
				},
			},
		],
	},
	{
		suiteDescription: 'Database values',
		suiteExpectedStatus: 200,
		cases: [
			{
				caseDescription: "cutOffTime isn't wiped if only leadTimeDays is changed",
				caseSetUp: async () => {
					await database
						.update(users)
						.set({
							cutOffTime: validBody.cutOffTime,
							leadTimeDays: 1,
						})
						.where(equals(users.email, userInputValues.email))
				},
				request: { ...validRequest, body: { leadTimeDays: 2 } as SettingsPATCHbody },
				assertions: async () => {
					const [foundUser] = await database.select().from(users).where(equals(users.email, userInputValues.email))

					expect(foundUser.cutOffTime).toEqual(validBody.cutOffTime)
					expect(foundUser.leadTimeDays).toEqual(2)
				},
			},
			{
				caseDescription: "leadTimeDays isn't wiped if only cutOffTime is changed",
				caseSetUp: async () => {
					await database
						.update(users)
						.set({
							cutOffTime: validBody.cutOffTime,
							leadTimeDays: 2,
						})
						.where(equals(users.email, userInputValues.email))
				},
				request: {
					...validRequest,
					body: {
						cutOffTime: tenPM,
					} as SettingsPATCHbody,
				},
				assertions: async () => {
					const [foundUser] = await database.select().from(users).where(equals(users.email, userInputValues.email))

					expect(foundUser.cutOffTime).toEqual(tenPM)
					expect(foundUser.leadTimeDays).toEqual(2)
				},
			},
		],
	},
	// Test that the cutOffTime doesn't change if only leadTimeDays is changed
]

describe('PATCH /api/settings', async () => {
	beforeAll(async () => {
		const { createdUser, requestCookie } = await createUser(userInputValues)
		joMarch = createdUser
		validRequestCookie = requestCookie
		await createFreeTrial({ userId: joMarch.id })
	})

	afterAll(async () => {
		await deleteUser(userInputValues.email)
	})

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
pnpm vitest src/app/api/settings
*/
