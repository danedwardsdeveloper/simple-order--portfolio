import { describe, test } from 'vitest'

type Case = {
	caseDescription: string
}

const toDos: Case[] = [
	{ caseDescription: 'Empty body' },
	{ caseDescription: `Email isn't confirmed` },
	{ caseDescription: 'Invalid request body' },
	{ caseDescription: 'Expired token' },
	{ caseDescription: 'Duplicate product name' },
	{ caseDescription: 'Missing name field' },
	{ caseDescription: 'Missing price field' },
	{ caseDescription: 'Rejects when there are too many products' },
	{ caseDescription: 'Name contains illegal characters' },
	{ caseDescription: 'Description contains illegal characters' },
	{ caseDescription: 'Description too long' },
	{ caseDescription: 'Price not a number' },
	{ caseDescription: 'Price too high' },
	{ caseDescription: 'Custom VAT not a number' },
	{ caseDescription: 'Custom VAT too high' },
	{ caseDescription: 'Custom VAT is a decimal' },
	{ caseDescription: 'Custom VAT is negative' },
	{ caseDescription: 'User not found' },
	{ caseDescription: 'No active subscription or trial' },
	{ caseDescription: 'Zero or negative price value' },
	{ caseDescription: 'Empty string for name after trimming' },
	{ caseDescription: 'Success case' },
]

describe('POST /inventory/admin', () => {
	for (const { caseDescription } of toDos) {
		test.skip(caseDescription, () => {
			//
		})
	}
})
