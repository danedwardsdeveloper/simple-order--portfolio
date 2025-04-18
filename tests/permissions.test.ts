import { describe, expect, test } from 'vitest'

interface TestCase {
	description: string
	value: string
	expected: boolean
}

const testCases: TestCase[] = [
	{
		description: '',
		value: '',
		expected: true,
	},
]

describe('Test collection', () => {
	for (const { description, value, expected } of testCases) {
		test(description, () => {
			expect(value).toBe(expected)
		})
	}
})
