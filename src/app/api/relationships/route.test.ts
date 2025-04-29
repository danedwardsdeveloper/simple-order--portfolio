import type { AsyncFunction, DangerousBaseUser, TestUserInputValues } from '@/types'
import { createUser, deleteUser, initialiseTestGETRequestMaker } from '@tests/utilities'
import { createRelationship } from '@tests/utilities/definitions/createRelationship'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

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
		const { createdUser, requestCookie: createdRequestCookie } = await createUser(emilyGilmoreInputValues)

		if (!createdUser || !createdRequestCookie) throw new Error('Failed to create new user')
		userOne = createdUser
		validRequestCookie = createdRequestCookie
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
				caseDescription: 'Only returns a developmentMessage when there are legitimately no users',
				caseAssertions: async () => {
					expect(Object.keys(jsonBody).length).toBe(1)
					expect(jsonBody).toHaveProperty('developmentMessage')
				},
			},
			{
				caseDescription: 'One relationship as customer',
				caseSetUp: async () => {
					const { createdUser } = await createUser(lukeDanesInputValues)
					userTwo = createdUser
					if (!userOne) throw new Error('User one was undefined')
					await createRelationship({ merchantId: userOne.id, customerId: userTwo?.id })
				},
				caseAssertions: async () => {
					expect(jsonBody).toEqual({
						customers: [
							{
								businessName: "Luke's Diner",
								// cspell:disable-next-line
								obfuscatedEmail: 'l***@lukesd****.com',
							},
						],
					})
				},
			},
		]

		test.skip('One relationship as merchant', async () => {
			//
		})

		test.skip('Merchant and customer relationship to the same user', async () => {
			//
		})

		test.skip('One merchant and one customer', async () => {
			//
		})

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
