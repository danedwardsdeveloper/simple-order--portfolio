import { describe, expect, test } from 'vitest'
import { strictSlugify } from './strictSlugify'

const testCases: { description: string; input: string; expected: string }[] = [
	{
		description: 'with apostrophes',
		input: `Julia's Joke Shop`,

		// cspell:disable-next-line
		expected: 'julias-joke-shop',
	},
	{
		description: 'removes @',
		input: 'business n@me',
		expected: 'business-nme',
	},
	{
		description: 'removes underscores',
		input: 'name_with_underscores',

		// cspell:disable-next-line
		expected: 'namewithunderscores',
	},
	{
		description: 'makes lowercase',
		input: 'SNAKE_SHOP',

		// cspell:disable-next-line
		expected: 'snakeshop',
	},
]

describe('Creates valid slugs', () => {
	for (const testCase of testCases) {
		test(testCase.description, () => {
			expect(strictSlugify(testCase.input)).toEqual(testCase.expected)
		})
	}
})

/* 
pnpm vitest src/library/utilities/public/definitions/strictSlugify
*/
