import { createFreeTrial } from '@/library/database/operations'
import { createFreeTrialEndTime } from '@/library/utilities/public'
import { createSubscription } from '@/library/utilities/server'
import type { AnonymousProduct, AsyncFunction, JsonData, TestUserInputValues } from '@/types'
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
	setUp?: AsyncFunction
	assertions?: AsyncFunction
	tearDown?: AsyncFunction
}

const toDos: Case[] = [
	{ caseDescription: 'Expired token' },
	{ caseDescription: 'Duplicate product name' },
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
	{ caseDescription: 'Zero or negative price value' },
	{ caseDescription: 'Empty string for name after trimming' },
	{ caseDescription: 'Success case' },
]

describe('POST /api/inventory/admin', () => {
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
		invalidBody?: AnonymousProduct | JsonData
		expectedStatus: number
	}[]

	const permissionCases: PermissionCases = [
		{
			caseDescription: 'Empty body',
			expectedStatus: 500, // ToDo: stop the route from crashing
			invalidBody: {},
		},
		{
			caseDescription: 'Invalid body',
			expectedStatus: 500,
			invalidBody: { invalid: 'body' },
		},
		{
			caseDescription: 'Missing name',
			expectedStatus: 400,
			invalidBody: { ...strawberryJam, name: '' },
		},
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
		// Success cases
		{
			caseDescription: 'email confirmed, yes subscription',
			emailConfirmed: true,
			subscription: true,
			expectedStatus: 201,
		},
		{
			caseDescription: 'email confirmed, yes trial',
			emailConfirmed: true,
			freeTrial: true,
			expectedStatus: 201,
		},
	]

	describe('Permissions', () => {
		beforeAll(async () => {
			await deleteUser(elizabethBennetInputValues.email)
		})

		afterEach(async () => {
			await deleteUser(elizabethBennetInputValues.email)
		})

		for (const { skip = false, caseDescription, emailConfirmed, freeTrial, subscription, invalidBody, expectedStatus } of permissionCases) {
			test.skipIf(skip)(caseDescription, async () => {
				const { createdUser, requestCookie } = await createUser({
					...elizabethBennetInputValues,
					emailConfirmed: Boolean(emailConfirmed),
				})

				if (freeTrial) await createFreeTrial({ userId: createdUser.id })

				if (subscription) {
					await createSubscription({
						userId: createdUser.id,
						stripeCustomerId: 'abcdefg',
						currentPeriodStart: new Date(),
						currentPeriodEnd: createFreeTrialEndTime(),
					})
				}

				const { response } = await makeRequest({
					requestCookie,
					body: invalidBody || strawberryJam,
				})

				expect(response.status).toBe(expectedStatus)
			})
		}
	})
})

/* 
pnpm vitest src/app/api/inventory/admin/POST
*/
