import { describe, expect, test } from 'vitest'
import { formatPrice } from './formatPrice'

interface Case {
	value: number
	expected: string | Error
}

const positiveCase: Case[] = [
	{ value: 0, expected: '0p' },
	{ value: 0.4, expected: '0p' },
	{ value: 0.5, expected: '1p' },
	{ value: 0.6, expected: '1p' },
	{ value: 1, expected: '1p' },
	{ value: 10, expected: '10p' },
	{ value: 99, expected: '99p' },
	{ value: 99.5, expected: '£1' },
	{ value: 100, expected: '£1' },
	{ value: 100.4, expected: '£1' },
	{ value: 100.5, expected: '£1.01' },
	{ value: 101, expected: '£1.01' },
	{ value: 110, expected: '£1.10' },
	{ value: 199, expected: '£1.99' },
	{ value: 200, expected: '£2' },
	{ value: 99999, expected: '£999.99' },
	{ value: 100000, expected: '£1,000' }, // Maximum value
	{ value: 100001, expected: new Error() },
]

const negativeCases: Case[] = [
	{ value: -0.4, expected: '0p' },
	{ value: -0.5, expected: '0p' },
	{ value: -0.6, expected: '-1p' },
	{ value: -1, expected: '-1p' },
	{ value: -1, expected: '-1p' },
	{ value: -10, expected: '-10p' },
	{ value: -99, expected: '-99p' },
	{ value: -100, expected: '-£1' },
	{ value: -101, expected: '-£1.01' },
	{ value: -110, expected: '-£1.10' },
	{ value: -199, expected: '-£1.99' },
	{ value: -200, expected: '-£2' },
	{ value: -99999, expected: '-£999.99' },
	{ value: -100000, expected: '-£1,000' },
	{ value: -100001, expected: '-£1,000.01' },
]

const edgeCases: Case[] = [{ value: Number.NaN, expected: new Error() }]

describe('formatPrice', () => {
	for (const { value, expected } of [...positiveCase, ...negativeCases, ...edgeCases]) {
		test(`${value} = ${expected}`, async () => {
			if (expected instanceof Error) {
				expect(() => formatPrice(value, 'GBP')).toThrow()
			} else {
				expect(formatPrice(value, 'GBP')).toEqual(expected)
			}
		})
	}
})

/* 
pnpm vitest src/library/utilities/public/definitions/formatting
*/
