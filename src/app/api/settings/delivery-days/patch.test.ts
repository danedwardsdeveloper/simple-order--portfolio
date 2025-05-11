import { friday, monday, thursday, tuesday, wednesday } from '@/library/constants'
import { database } from '@/library/database/connection'
import { createFreeTrial } from '@/library/database/operations'
import { acceptedDeliveryDays } from '@/library/database/schema'
import { equals } from '@/library/utilities/server'
import type { AsyncFunction, DangerousBaseUser, TestUserInputValues } from '@/types'
import type { JsonData } from '@tests/types'
import { createTestUser, deleteUser, initialiseTestRequestMaker } from '@tests/utilities'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import type { SettingsDeliveryDaysPATCHbody } from './patch'

const makeRequest = initialiseTestRequestMaker({
	basePath: '/settings/delivery-days',
	method: 'PATCH',
})

const userInputValues: TestUserInputValues = {
	firstName: 'Kylie',
	lastName: 'Minogue',
	businessName: 'Spinning Around Inc',
	email: 'kylie@minogue.com',
	password: 'C@ntGetY0uOutOfMyH3ad',
}

function assertKylieMinogue(): DangerousBaseUser {
	if (!kylieMinogue) throw new Error('Kylie Minogue not defined')
	return kylieMinogue
}

async function getDatabaseDeliveryDays(): Promise<number[]> {
	const result = await database
		.select({ dayOfWeekId: acceptedDeliveryDays.dayOfWeekId })
		.from(acceptedDeliveryDays)
		.where(equals(acceptedDeliveryDays.userId, assertKylieMinogue().id))

	return result.map((row) => row.dayOfWeekId)
}

let kylieMinogue: DangerousBaseUser | undefined
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

const validBody: SettingsDeliveryDaysPATCHbody = {
	updatedWeekDayIndexes: [1, 2, 3, 4, 5, 6],
}

const validRequest = {
	cookie: () => validRequestCookie,
	body: () => validBody,
}

const suites: TestSuite[] = [
	{
		suiteDescription: 'Rejected',
		suiteExpectedStatus: 400,
		cases: [
			{
				caseDescription: 'Try to use 0 as a week day index',
				request: {
					...validRequest,
					body: {
						updatedWeekDayIndexes: [0, monday, tuesday],
					} as unknown as SettingsDeliveryDaysPATCHbody,
				},
			},
			{
				caseDescription: 'Empty array',
				request: {
					...validRequest,
					body: {
						updatedWeekDayIndexes: [],
					} satisfies SettingsDeliveryDaysPATCHbody,
				},
			},
		],
	},
	{
		suiteDescription: 'Database values',
		suiteExpectedStatus: 200,
		cases: [
			{
				caseDescription: 'Update to accept only Monday to Thursday',
				request: {
					...validRequest,
					body: {
						updatedWeekDayIndexes: [monday, tuesday, wednesday, thursday],
					} satisfies SettingsDeliveryDaysPATCHbody,
				},
				assertions: async () => {
					expect(await getDatabaseDeliveryDays()).toEqual([monday, tuesday, wednesday, thursday])
				},
			},
		],
	},
]

describe('PATCH /api/settings/delivery-days', async () => {
	beforeAll(async () => {
		const { createdUser, validCookie } = await createTestUser(userInputValues)
		kylieMinogue = createdUser
		validRequestCookie = validCookie
		await createFreeTrial({ userId: kylieMinogue.id })
	})

	afterAll(async () => {
		await deleteUser(userInputValues.email)
	})

	test('Default days from createUser are Monday - Friday', async () => {
		expect(await getDatabaseDeliveryDays()).toEqual([monday, tuesday, wednesday, thursday, friday])
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
pnpm vitest src/app/api/settings/delivery-days/patch
*/
