import { database } from '@/library/database/connection'
import { createFreeTrial, deleteFreeTrial } from '@/library/database/operations'
import { users } from '@/library/database/schema'
import { createCutOffTime } from '@/library/utilities/public'
import { equals } from '@/library/utilities/server'
import type { AsyncFunction, DangerousBaseUser, TestUserInputValues } from '@/types'
import type { JsonData } from '@tests/types'
import { createTestUser, deleteUser, getUserFromDatabase, initialiseTestRequestMaker } from '@tests/utilities'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import type { SettingsPATCHbody } from './patch'

const makeRequest = initialiseTestRequestMaker({
	basePath: '/settings',
	method: 'PATCH',
})

const userInputValues: TestUserInputValues = {
	firstName: 'Jo',
	lastName: 'March',
	businessName: 'March Writers',
	email: 'jo@march.com',
	password: 'L1ttleW0men!',
}

function assertJoMarch(): DangerousBaseUser {
	if (!joMarch) throw new Error('Jo March not defined')
	return joMarch
}

async function getJoMarchFromDatabase() {
	return await getUserFromDatabase({ email: userInputValues.email })
}

let joMarch: DangerousBaseUser | undefined
let validRequestCookie: string | undefined

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
				caseDescription: 'Success without a trial',
				caseSetUp: async () => {
					await deleteFreeTrial(assertJoMarch().id)
				},
				request: validRequest,
				caseExpectedStatus: 200,
				caseTearDown: async () => {
					await createFreeTrial({ userId: assertJoMarch().id })
				},
			},
			{
				caseDescription: 'Success with a trial',
				request: validRequest,
				caseExpectedStatus: 200,
			},
		],
	},
	{
		suiteDescription: 'Success cases',
		suiteExpectedStatus: 200,
		cases: [
			{
				caseDescription: 'Updates minimumSpendPence',
				request: {
					...validRequest,
					body: { minimumSpendPence: 3000 } satisfies SettingsPATCHbody,
				},
				assertions: async () => {
					expect((await getJoMarchFromDatabase()).minimumSpendPence).toEqual(3000)
				},
			},
			{
				caseDescription: 'Updates the cutOffTime',
				request: {
					...validRequest,
					body: {
						cutOffTime: createCutOffTime({
							hours: 13, //
							minutes: 0,
						}),
					} satisfies SettingsPATCHbody,
				},
				assertions: async () => {
					const utcCutoffTime = createCutOffTime({
						hours: 13,
						minutes: 0,
					})
					expect((await getJoMarchFromDatabase()).cutOffTime).toEqual(utcCutoffTime)
				},
			},
			{
				caseDescription: 'Update leadTimeDays',
				request: {
					...validRequest,
					body: {
						leadTimeDays: 4,
					} satisfies SettingsPATCHbody,
				},
				assertions: async () => {
					expect((await getJoMarchFromDatabase()).leadTimeDays).toEqual(4)
				},
			},
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
		const { createdUser, validCookie } = await createTestUser(userInputValues)
		joMarch = createdUser
		validRequestCookie = validCookie
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

					if (assertions) await assertions()

					expect(data.response.status).toEqual(caseExpectedStatus || suiteExpectedStatus)

					if (caseTearDown) await caseTearDown()
				})
			}
		})
	}
})

/* 
pnpm vitest src/app/api/settings/patch
*/
