import type { AsyncFunction, DangerousBaseUser, TestUserInputValues } from '@/types'
import { createTestUser, deleteUser, initialiseTestGETRequestMaker } from '@tests/utilities'
import { createRelationship } from '@tests/utilities/definitions/createRelationship'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import type { RelationshipsGETresponse } from './route'

describe('/api/relationships', () => {
	const makeRequest = initialiseTestGETRequestMaker('/relationships')

	let validRequestCookie: string | undefined
	let userOne: DangerousBaseUser | undefined
	let userTwo: DangerousBaseUser | undefined

	const emilyGilmoreInputValues: TestUserInputValues = {
		firstName: 'Emily',
		lastName: 'Gilmore',
		businessName: 'Emily Gilmore Enterprises',
		email: 'email@gmail.com',
		password: 'D@rT0wn!123',
	}

	const lukeDanesInputValues: TestUserInputValues = {
		firstName: 'Luke',
		lastName: 'Danes',
		businessName: "Luke's Diner",
		email: 'luke@lukesdiner.com',
		password: 'C0ffee&P@ncakes',
	}

	beforeAll(async () => {
		const { createdUser, validCookie } = await createTestUser(emilyGilmoreInputValues)

		if (!createdUser || !validCookie) throw new Error('Failed to create new user')
		userOne = createdUser
		validRequestCookie = validCookie
	})

	afterAll(async () => {
		await deleteUser(emilyGilmoreInputValues.email)
		await deleteUser(lukeDanesInputValues.email)
	})

	type RejectedCase = {
		caseDescription: string
		requestCookie: string | undefined
	}

	const invalidCases: RejectedCase[] = [
		{
			caseDescription: 'No cookie',
			requestCookie: undefined,
		},
		{
			caseDescription: 'Invalid cookie format',
			requestCookie: 'bad-cookie',
		},
		{
			caseDescription: 'Expired cookie',
			requestCookie: validRequestCookie, // ToDo!
		},
	]

	test.skip('Permissions tests - email confirmed etc. ', async () => {
		//
	})

	describe('Invalid cases', () => {
		for (const { caseDescription, requestCookie } of invalidCases) {
			test(caseDescription, async () => {
				const { response } = await makeRequest({ requestCookie })
				expect(response.status).toBe(401)
			})
		}
	})

	describe('Accepted cases', () => {
		type AcceptedCase = {
			caseDescription: string
			caseSetUp?: AsyncFunction
			caseAssertions: AsyncFunction
		}

		// biome-ignore lint/suspicious/noExplicitAny:
		let jsonBody: any | undefined

		const acceptedCases: AcceptedCase[] = [
			{
				caseDescription: 'One relationship as customer',
				caseSetUp: async () => {
					const { createdUser } = await createTestUser(lukeDanesInputValues)
					userTwo = createdUser
					if (!userOne) throw new Error('User one was undefined')
					await createRelationship({ merchantId: userOne.id, customerId: userTwo?.id })
				},
				caseAssertions: async () => {
					expect(jsonBody).toEqual({
						ok: true,
						confirmedCustomers: [
							{
								businessName: "Luke's Diner",
								// cspell:disable-next-line
								obfuscatedEmail: 'l***@lukesd****.com',
							},
						],
						confirmedMerchants: null,
					} satisfies RelationshipsGETresponse)
				},
			},
		]

		for (const { caseDescription, caseSetUp, caseAssertions } of acceptedCases) {
			test(caseDescription, async () => {
				if (caseSetUp) await caseSetUp()

				const { response } = await makeRequest({ requestCookie: validRequestCookie })

				expect(response.status).toBe(200)

				jsonBody = await response.json()

				await caseAssertions()
			})
		}
	})
})

/* 
pnpm vitest src/app/api/relationships
*/
