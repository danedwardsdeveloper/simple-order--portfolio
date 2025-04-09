import { describe, expect, test } from 'vitest'
import { isValidDate } from './isValidDate'

const acceptedDates = [
	{ name: 'new Date()', content: new Date() },
	{ name: 'specific date', content: new Date('2023-01-01') },
	{ name: 'date with time', content: new Date('2023-01-01T12:30:00') },
	{ name: 'leap year date', content: new Date('2024-02-29') },
	{ name: 'date at month end', content: new Date('2023-12-31') },
	{ name: 'UTC date', content: new Date('2023-01-01T00:00:00Z') },
	{ name: 'timestamp date', content: new Date(946684800000) },
	{ name: 'min date', content: new Date(0) },
	{ name: 'old date', content: new Date('1000-01-01') },
	{ name: 'future date', content: new Date('9999-12-31') },
]

const rejectedDates = [
	{ name: 'invalid date string', content: new Date('not-a-date') },
	{ name: 'invalid month', content: new Date('2023-13-01') },
	{ name: 'invalid day', content: new Date('2023-02-99') },
	{ name: 'null', content: null },
	{ name: 'undefined', content: undefined },
	{ name: 'string', content: '2023-01-01' },
	{ name: 'number', content: 946684800000 },
	{ name: 'empty object', content: {} },
	{ name: 'array', content: [] },
	{ name: 'boolean', content: true },
	{ name: 'date-like object', content: { getTime: () => 946684800000 } },
]

describe('isValidDate', () => {
	for (const testCase of acceptedDates) {
		test(`Accepts ${testCase.name}`, () => {
			expect(isValidDate(testCase.content)).toBe(true)
		})
	}

	for (const testCase of rejectedDates) {
		test(`Rejects ${testCase.name}`, () => {
			expect(isValidDate(testCase.content as Date)).toBe(false)
		})
	}
})

/* 
pnpm vitest src/library/utilities/public/definitions/isValidDate
*/
