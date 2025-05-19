import type { AsyncFunction } from '@/types'

export interface TestSuite {
	suiteDescription: string
	suiteExpectedStatus?: number
	suiteSetUp?: AsyncFunction
	suiteMockedTime?: Date
	suiteTearDown?: AsyncFunction
	cases: TestCase[]
}

export interface TestCase {
	caseDescription: string
	caseMockedTime?: Date
	caseSetUp?: AsyncFunction
	caseTearDown?: AsyncFunction
	assertions: AsyncFunction
}

/*
import type { AsyncFunction } from '@/types'
import { afterAll, beforeAll, describe, test } from 'vitest'

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
	caseSetUp?: AsyncFunction
	caseTearDown?: AsyncFunction
	assertions: AsyncFunction
}

const suites: TestSuite[] = [
	{
		suiteDescription: 'Suite one',
		cases: [
			{
				caseDescription: 'Test one',
				caseSetUp: async () => {
					//
				},
				caseTearDown: async () => {
					//
				},
				assertions: async () => {
					//
				},
			},
		],
	},
]

describe('PATCH /api/inventory/[itemId]', () => {
	beforeAll(async () => {
		//
	})

	afterAll(async () => {
		//
	})

	for (const { suiteDescription, cases } of suites) {
		describe(suiteDescription, async () => {
			for (const { caseDescription, caseSetUp, caseTearDown, assertions } of cases) {
				test(caseDescription, async () => {
					if (caseSetUp) await caseSetUp()
					await assertions()
					if (caseTearDown) await caseTearDown()
				})
			}
		})
	}
})
*/
