import { createFreeTrial } from '@/library/database/operations'
import type { AnonymousProduct, TestUserInputValues } from '@/types'
import { createUser, deleteUser, initialiseTestRequestMaker } from '@tests/utilities'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'

// add an item to the inventory

const makeRequest = initialiseTestRequestMaker({
	basePath: '/inventory/admin',
	method: 'POST',
})

// Main ToDo: Get all these tests passing

/*
COOKIE TESTS
- Missing
- Malformed
- Expired
- User not found
*/

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

	/*
	let elizabethBennet: DangerousBaseUser | undefined
	let validRequestCookie: string | undefined

	beforeAll(async () => {
		elizabethBennet = createdUser
		validRequestCookie = requestCookie
		if (!elizabethBennet) throw new Error('Failed to create user')
		if (!validRequestCookie) throw new Error('Failed to create cookie')
	})
	*/

	const elizabethBennetInputValues: TestUserInputValues = {
		firstName: 'Elizabeth',
		lastName: 'Bennet',
		businessName: 'Longbourn Estate',
		email: 'lizzie@longbourn.com',
		password: 'PrideN0tPr3judice',
		emailConfirmed: false, // Important!
	}

	const strawberryJam: AnonymousProduct = {
		name: 'Strawberry jam',
		priceInMinorUnits: 213,
		description: 'A delicious homemade conserve made',
		customVat: 15,
	}

	describe.skip('Cookies', () => {
		//
	})

	describe.skip('Database content', () => {
		//
	})

	/*
			PERMISSION TESTS
Accepted
email confirmed, trial → ACCEPTED
email confirmed, subscription → ACCEPTED
			- 
			*/

	type PermissionCases = {
		skip?: boolean
		caseDescription: string
		emailConfirmed?: boolean
		freeTrial?: boolean
		subscription?: boolean
		expectedStatus: number
	}[]

	const permissionCases: PermissionCases = [
		{
			caseDescription: 'email not confirmed, no trial, no subscription',
			expectedStatus: 403,
		},
		{
			caseDescription: 'email not confirmed, yes trial',
			freeTrial: true,
			expectedStatus: 403,
		},
		{
			skip: true,
			caseDescription: 'email not confirmed, yes subscription',
			subscription: true,
			expectedStatus: 400,
		},
		{
			caseDescription: 'email confirmed, no trial, no subscription',
			emailConfirmed: true,
			expectedStatus: 403,
		},
	]

	describe('Permissions', () => {
		beforeAll(async () => {
			await deleteUser(elizabethBennetInputValues.email)
		})

		afterEach(async () => {
			await deleteUser(elizabethBennetInputValues.email)
		})

		for (const { skip = false, caseDescription, emailConfirmed, freeTrial, subscription, expectedStatus } of permissionCases) {
			test.skipIf(skip)(caseDescription, async () => {
				const { createdUser, requestCookie } = await createUser({
					...elizabethBennetInputValues,
					emailConfirmed: Boolean(emailConfirmed),
				})

				if (freeTrial) await createFreeTrial({ userId: createdUser.id })
				if (subscription) {
					// await createSubscription({userId: createdUser.id})
				}

				const { response } = await makeRequest({
					requestCookie,
					body: strawberryJam,
				})

				expect(response.status).toBe(expectedStatus)
			})
		}
	})
})

/* 
pnpm vitest src/app/api/inventory/admin/POST
*/
