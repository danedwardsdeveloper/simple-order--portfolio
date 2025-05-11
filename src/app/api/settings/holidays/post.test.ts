import { august, december, http409conflict, january, july, march } from '@/library/constants'
import { database } from '@/library/database/connection'
import { createFreeTrial } from '@/library/database/operations'
import { holidays } from '@/library/database/schema'
import { createDate } from '@/library/utilities/public'
import { equals } from '@/library/utilities/server'
import type { AsyncFunction, DangerousBaseUser, Holiday, HolidayInsert, TestUserInputValues } from '@/types'
import type { JsonData } from '@tests/types'
import { createTestUser, deleteUser, initialiseTestRequestMaker } from '@tests/utilities'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import type { SettingsHolidaysPOSTbody } from './post'

const makeRequest = initialiseTestRequestMaker({
	basePath: '/settings/holidays',
	method: 'POST',
})

const userInputValues: TestUserInputValues = {
	firstName: 'Ariel',
	lastName: 'Triton',
	businessName: 'Under The Sea Collectibles',
	email: 'ariel@atlantica.com',
	password: 'Dingleh0pper!',
}

function assertAriel(): DangerousBaseUser {
	if (!ariel) throw new Error('Ariel not defined')
	return ariel
}

async function getDatabaseHolidays(): Promise<Holiday[]> {
	return await database
		.select({ startDate: holidays.startDate, endDate: holidays.endDate })
		.from(holidays)
		.where(equals(holidays.userId, assertAriel().id))
}

async function clearHolidays() {
	await database.delete(holidays).where(equals(holidays.userId, assertAriel().id))
}

async function addHolidays(holidaysToAdd: Holiday[]) {
	const insertValues: HolidayInsert[] = holidaysToAdd.map((holiday) => ({
		userId: assertAriel().id,
		startDate: holiday.startDate,
		endDate: holiday.endDate ?? holiday.startDate,
	}))
	await database.insert(holidays).values(insertValues)
}

let ariel: DangerousBaseUser | undefined
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
	cookie: () => string | undefined
	body: JsonData
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

const validBody: SettingsHolidaysPOSTbody = {
	holidaysToAdd: [
		{
			startDate: createDate(10, january, 2026),
			endDate: createDate(15, january, 2026),
		},
	],
}

const validRequest = {
	cookie: () => validRequestCookie,
	body: validBody,
}

const suites: TestSuite[] = [
	{
		suiteDescription: 'Rejected',
		suiteExpectedStatus: http409conflict,
		suiteBeforeEach: clearHolidays,
		cases: [
			{
				caseDescription: 'Duplicate request',
				caseSetUp: async () => {
					await addHolidays(validBody.holidaysToAdd)
				},
				request: validRequest,
			},
			{
				caseDescription: 'In the past',
				caseExpectedStatus: 400,
				request: {
					...validRequest,
					body: {
						holidaysToAdd: [
							{
								startDate: createDate(1, january, 2025),
								endDate: createDate(3, january, 2025),
							},
						],
					} satisfies SettingsHolidaysPOSTbody,
				},
			},
			{
				caseDescription: 'nested dates',
				caseSetUp: async () => {
					await addHolidays([
						{
							startDate: createDate(10, march, 2027),
							endDate: createDate(15, march, 2027),
						},
					])
				},
				request: {
					...validRequest,
					body: {
						holidaysToAdd: [
							{
								startDate: createDate(11, march, 2027),
								endDate: createDate(14, march, 2027),
							},
						],
					} satisfies SettingsHolidaysPOSTbody,
				},
			},
			{
				caseDescription: 'Overlapping dates',
				caseSetUp: async () => {
					await addHolidays([
						{
							startDate: createDate(27, july, 2027),
							endDate: createDate(29, july, 2027),
						},
					])
				},
				request: {
					...validRequest,
					body: {
						holidaysToAdd: [
							{
								startDate: createDate(27, july, 2027),
								endDate: createDate(28, july, 2027),
							},
						],
					} satisfies SettingsHolidaysPOSTbody,
				},
			},
		],
	},
	{
		suiteDescription: 'Database values',
		suiteExpectedStatus: 200,
		suiteBeforeEach: clearHolidays,
		cases: [
			{
				caseDescription: 'Accepts a multi-day holiday',
				request: {
					...validRequest,
					body: {
						holidaysToAdd: [
							{
								startDate: createDate(23, december, 2026),
								endDate: createDate(4, january, 2027),
							},
						],
					} satisfies SettingsHolidaysPOSTbody,
				},
				assertions: async () => {
					expect(await getDatabaseHolidays()).toEqual([
						{
							endDate: new Date('2027-01-04'),
							startDate: new Date('2026-12-23'),
						},
					])
				},
			},
			{
				caseDescription: 'Accepts a single-day holiday',
				request: {
					...validRequest,
					body: {
						holidaysToAdd: [
							{
								startDate: createDate(2, august, 2026),
							},
						],
					} satisfies SettingsHolidaysPOSTbody,
				},
				assertions: async () => {
					expect(await getDatabaseHolidays()).toEqual([
						{
							endDate: new Date('2026-08-02'),
							startDate: new Date('2026-08-02'),
						},
					])
				},
			},
		],
	},
]

describe('POST /api/settings/holidays', async () => {
	beforeAll(async () => {
		const { createdUser, validCookie } = await createTestUser(userInputValues)
		ariel = createdUser
		validRequestCookie = validCookie
		await createFreeTrial({ userId: ariel.id })
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

					const data = await makeRequest({
						requestCookie: cookie(),
						body,
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
pnpm vitest src/app/api/settings/holidays
*/
