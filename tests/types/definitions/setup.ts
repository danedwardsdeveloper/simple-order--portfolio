import type { AsyncFunction } from '@/types'

export interface TestFile {
	fileDescription: string
	fileSetUp?: AsyncFunction
	fileTearDown?: AsyncFunction
	suites: TestSuite[]
}

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
import type { TestUserInputValues } from '@/types'
import type { TestFile } from '@tests/types'
import { afterAll, beforeAll, describe, test } from 'vitest'

const file: TestFile = {
	fileDescription: 'file description',
	suites: [
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
	],
}

const { fileDescription, fileSetUp, fileTearDown, suites } = file

describe(fileDescription, () => {
	beforeAll(async () => {
		if (fileSetUp) await fileSetUp()
	})

	afterAll(async () => {
		if (fileTearDown) await fileTearDown()
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
