import { august, friday, january, monday, thursday, tuesday, wednesday } from '@/library/constants'
import { createCutOffTime, createDate } from '@/library/shared'
import type { AsyncFunction } from '@/types'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import { type Props as FunctionProps, getAvailableDeliveryDays } from '.'
import { formatDateWithDayName } from '../formatting'

interface TestFile {
	fileDescription: string
	fileSetUp?: AsyncFunction
	fileTearDown?: AsyncFunction
	suites: TestSuite[]
}

const defaultInput: FunctionProps = {
	acceptedWeekDayIndices: [monday, tuesday, wednesday, thursday, friday],
	holidays: null,
	lookAheadDays: 14,
	cutOffTime: createCutOffTime({ hours: 18, minutes: 0 }),
	leadTimeDays: 1,
}

interface TestSuite {
	suiteDescription: string
	suiteSetUp?: AsyncFunction
	suiteMockedTime: Date
	suiteTearDown?: AsyncFunction
	cases: TestCase[]
}

interface TestCase {
	caseDescription: string
	caseSetUp?: AsyncFunction
	caseTearDown?: AsyncFunction
	input: FunctionProps
	expectedFormattedOutput: string[] | null
}

const file: TestFile = {
	fileDescription: 'getAvailableDeliveryDays',
	suites: [
		{
			suiteDescription: 'Accepted, Winter time',
			suiteMockedTime: new Date(2025, january, 1, 11, 59),
			cases: [
				{
					caseDescription: 'Standard weekday deliveries',
					input: defaultInput,
					expectedFormattedOutput: [
						'Thursday, 2 January 2025',
						'Friday, 3 January 2025',
						// No Saturday, No Sunday
						'Monday, 6 January 2025',
						'Tuesday, 7 January 2025',
						'Wednesday, 8 January 2025',
						'Thursday, 9 January 2025',
						'Friday, 10 January 2025',
						// No Saturday, No Sunday
						'Monday, 13 January 2025',
						'Tuesday, 14 January 2025',
					],
				},
				{
					caseDescription: 'Accept same-day delivery for order placed at 11.59am with noon cutoff',
					input: { ...defaultInput, leadTimeDays: 0, cutOffTime: createCutOffTime({ hours: 12, minutes: 0 }) },
					expectedFormattedOutput: [
						'Wednesday, 1 January 2025', // Same day
						'Thursday, 2 January 2025',
						'Friday, 3 January 2025',
						// No Saturday, No Sunday
						'Monday, 6 January 2025',
						'Tuesday, 7 January 2025',
						'Wednesday, 8 January 2025',
						'Thursday, 9 January 2025',
						'Friday, 10 January 2025',
						// No Saturday, No Sunday
						'Monday, 13 January 2025',
						'Tuesday, 14 January 2025',
					],
				},
			],
		},
		{
			suiteDescription: 'Accepted, Summer time',
			suiteMockedTime: new Date(2025, august, 1, 11, 59),
			cases: [
				{
					caseDescription: 'Standard weekday deliveries',
					input: defaultInput,
					expectedFormattedOutput: [
						// No Saturday (2), No Sunday (3)
						'Monday, 4 August 2025',
						'Tuesday, 5 August 2025',
						'Wednesday, 6 August 2025',
						'Thursday, 7 August 2025',
						'Friday, 8 August 2025',
						// No Saturday (9), No Sunday (10)
						'Monday, 11 August 2025',
						'Tuesday, 12 August 2025',
						'Wednesday, 13 August 2025',
						'Thursday, 14 August 2025',
					],
				},
				{
					caseDescription: 'Accept same-day delivery for order placed at 11.59am with noon cutoff',
					input: { ...defaultInput, leadTimeDays: 0, cutOffTime: createCutOffTime({ hours: 12, minutes: 0 }) },
					expectedFormattedOutput: [
						'Friday, 1 August 2025', // Same day
						// No Saturday (2), No Sunday (3)
						'Monday, 4 August 2025',
						'Tuesday, 5 August 2025',
						'Wednesday, 6 August 2025',
						'Thursday, 7 August 2025',
						'Friday, 8 August 2025',
						// No Saturday (9), No Sunday (10)
						'Monday, 11 August 2025',
						'Tuesday, 12 August 2025',
						'Wednesday, 13 August 2025',
						'Thursday, 14 August 2025',
					],
				},
				{
					caseDescription: 'Standard weekdays with a bank holiday',
					input: {
						...defaultInput, //
						holidays: [{ startDate: createDate(4, august, 2025), endDate: createDate(4, august, 2025) }],
					},
					expectedFormattedOutput: [
						// Saturday 2,
						// Sunday 3
						// Monday 4 - bank holiday
						'Tuesday, 5 August 2025',
						'Wednesday, 6 August 2025',
						'Thursday, 7 August 2025',
						'Friday, 8 August 2025',
						// No Saturday (9), No Sunday (10)
						'Monday, 11 August 2025',
						'Tuesday, 12 August 2025',
						'Wednesday, 13 August 2025',
						'Thursday, 14 August 2025',
					],
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

	beforeEach(() => vi.useFakeTimers())

	afterEach(() => vi.useRealTimers())

	afterAll(async () => {
		if (fileTearDown) await fileTearDown()
	})

	for (const { suiteDescription, suiteSetUp, suiteMockedTime, cases, suiteTearDown } of suites) {
		describe(suiteDescription, () => {
			beforeAll(async () => {
				if (suiteSetUp) await suiteSetUp()
			})

			afterAll(async () => {
				if (suiteTearDown) await suiteTearDown()
			})

			for (const { caseDescription, caseSetUp, caseTearDown, input, expectedFormattedOutput } of cases) {
				test(caseDescription, async () => {
					try {
						vi.setSystemTime(suiteMockedTime)
						if (caseSetUp) await caseSetUp()

						const output = getAvailableDeliveryDays(input)

						// Format both actual and expected dates
						const formattedOutput = output?.map((date) => formatDateWithDayName(date)) || null

						expect(formattedOutput).toEqual(expectedFormattedOutput)
					} finally {
						if (caseTearDown) await caseTearDown()
					}
				})
			}
		})
	}
})

/* 
pnpm vitest src/library/utilities/public/definitions/getAvailableDeliveryDays
*/
