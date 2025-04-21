import { describe, expect, test } from 'vitest'

interface Suite {
	description: string
	cases: {
		description: string
		value: string
		expected: string
	}[]
}

const suites: Suite[] = [
	{
		description: 'Rejected',
		cases: [
			{ description: '', value: '', expected: '' },
			{ description: '', value: '', expected: '' },
			{ description: '', value: '', expected: '' },
		],
	},
	{
		description: 'Success',
		cases: [{ description: '', value: '', expected: '' }],
	},
]

describe('Description', () => {
	for (const { description, cases } of suites) {
		describe(description, () => {
			for (const { description, value, expected } of cases) {
				test(description, async () => {
					expect(value).toBe(expected)
				})
			}
		})
	}
})

/* 
pnpm vitest
*/
