import type { AsyncFunction } from '@/types'
import { describe, test } from 'vitest'

interface Suite {
	suiteDescription: string
	suiteSetUp?: AsyncFunction
	suiteTearDown?: AsyncFunction
	cases: Case[]
}

interface Case {
	caseDescription: string
	caseSetUp?: AsyncFunction
	caseTearDown?: AsyncFunction
	assertions: AsyncFunction
}

describe('Test collection', () => {
	const suites: Suite[] = [
		{
			suiteDescription: 'Suite one',
			suiteSetUp: async () => {
				//
			},
			suiteTearDown: async () => {
				//
			},
			cases: [
				{
					caseDescription: 'Test one',
					assertions: async () => {
						//
					},
				},
			],
		},
	]

	for (const { suiteDescription, suiteSetUp, suiteTearDown, cases } of suites) {
		describe(suiteDescription, async () => {
			if (suiteSetUp) await suiteSetUp()
			for (const { caseDescription, caseSetUp, caseTearDown, assertions } of cases) {
				test(caseDescription, async () => {
					if (caseSetUp) await caseSetUp()
					await assertions()
					if (caseTearDown) await caseTearDown()
				})
				if (suiteTearDown) await suiteTearDown()
			}
		})
	}
})
