import { describe, expect, test } from 'vitest'

interface Case {
	description: string
	setUp?: () => Promise<void>
	tearDown?: () => Promise<void>
	assertions: () => number<void>
}

describe('Suite', () => {
	const successCases: Case[] = [
		{
			description: 'Case description',
			setUp: async () => {},
			tearDown: async () => {},
			assertions: (number: number) => Number.isFinite(number)
		},
	]

	for (const { description, setUp, tearDown, assertions } of successCases) {
		test(description, async () => {
			if (setUp) await setUp()

			const response = 1
			expect(response).toBe(200)
			await assertions(response)

			if (tearDown) await tearDown()
		})
	}
})
