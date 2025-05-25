import { january } from '@/library/constants'
import { database } from '@/library/database/connection'
import { holidays } from '@/library/database/schema'
import { createDate } from '@/library/utilities/public'
import { equals } from '@/library/utilities/server'
import type { AsyncFunction, DangerousBaseUser, TestUserInputValues } from '@/types'
import { createTestUser, deleteUser } from '@tests/utilities'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import { getHolidays } from '.'

interface TestFile {
	fileDescription: string
	fileSetUp?: AsyncFunction
	fileTearDown?: AsyncFunction
	suites: TestSuite[]
}

interface TestSuite {
	suiteDescription: string
	suiteExpectedStatus?: number
	suiteSetUp?: AsyncFunction
	suiteMockedTime?: Date
	suiteTearDown?: AsyncFunction
	cases: TestCase[]
}

interface TestCase {
	caseDescription: string
	caseMockedTime?: Date
	caseLookAheadDays?: number
	caseSetUp?: AsyncFunction
	caseTearDown?: AsyncFunction
	expectedResult: Date[]
}

const userInputValues: TestUserInputValues = {
	firstName: 'Kim',
	lastName: 'Woodburn',
	businessName: 'How Clean Is Your House',
	email: 'kim@cleaning.com',
	password: 'Cl3@nAndTidy!',
	emailConfirmed: true,
}

let kimWoodburn: DangerousBaseUser
let getHolidaysResult: Date[] | null

function getKimWoodburn(): DangerousBaseUser {
	if (!kimWoodburn) throw new Error('Kim Woodburn not defined')
	return kimWoodburn
}

const file: TestFile = {
	fileDescription: 'getHolidays',
	fileSetUp: async () => {
		const { createdUser } = await createTestUser(userInputValues)
		kimWoodburn = createdUser
	},
	fileTearDown: async () => {
		await deleteUser(userInputValues.email)
	},
	suites: [
		{
			suiteDescription: 'Suite one',
			suiteMockedTime: createDate(1, january, 2025),
			cases: [
				{
					caseDescription: 'Single holiday',
					caseSetUp: async () => {
						await database.insert(holidays).values({
							userId: getKimWoodburn().id,
							startDate: createDate(7, january, 2025),
							endDate: createDate(7, january, 2025),
						})
					},
					expectedResult: [new Date('2025-01-07')],
					caseTearDown: async () => {
						await database.delete(holidays).where(equals(holidays.userId, getKimWoodburn().id))
					},
				},
				{
					caseDescription: 'Three-day holiday',
					caseSetUp: async () => {
						await database.insert(holidays).values({
							userId: getKimWoodburn().id,
							startDate: createDate(10, january, 2025),
							endDate: createDate(12, january, 2025),
						})
					},
					expectedResult: [
						new Date('2025-01-10'), //
						new Date('2025-01-11'),
						new Date('2025-01-12'),
					],
					caseTearDown: async () => {
						await database.delete(holidays).where(equals(holidays.userId, getKimWoodburn().id))
					},
				},
				{
					caseDescription: 'Four-day holiday but the last day is out of range',
					caseSetUp: async () => {
						await database.insert(holidays).values({
							userId: getKimWoodburn().id,
							startDate: createDate(13, january, 2025),
							endDate: createDate(16, january, 2025),
						})
					},
					expectedResult: [
						new Date('2025-01-13'), //
						new Date('2025-01-14'),
						new Date('2025-01-15'),
					],
					caseTearDown: async () => {
						await database.delete(holidays).where(equals(holidays.userId, getKimWoodburn().id))
					},
				},
			],
		},
	],
}

const { fileDescription, fileSetUp, fileTearDown, suites } = file

describe(fileDescription, () => {
	beforeAll(async () => {
		if (fileSetUp) await fileSetUp()
	})

	afterEach(() => vi.useRealTimers())

	afterAll(async () => {
		if (fileTearDown) await fileTearDown()
	})

	for (const { suiteDescription, suiteMockedTime, cases } of suites) {
		describe(suiteDescription, () => {
			beforeEach(() => vi.setSystemTime(suiteMockedTime || new Date()))

			for (const { caseDescription, caseSetUp, caseTearDown, caseLookAheadDays, expectedResult } of cases) {
				test(caseDescription, async () => {
					if (caseSetUp) await caseSetUp()

					getHolidaysResult = await getHolidays({ merchantProfile: getKimWoodburn(), lookAheadDays: caseLookAheadDays || 14 })

					expect(getHolidaysResult).toEqual(expectedResult)
					if (caseTearDown) await caseTearDown()
				})
			}
		})
	}
})

/* 
pnpm vitest src/library/database/operations/definitions/getHolidays
*/
