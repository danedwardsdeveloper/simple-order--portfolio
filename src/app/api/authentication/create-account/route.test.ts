import { database } from '@/library/database/connection'
import { confirmationTokens, freeTrials, users } from '@/library/database/schema'
import { equals } from '@/library/utilities/server'
import type { AsyncFunction, BrowserSafeCompositeUser, DangerousBaseUser, JsonData } from '@/types'
import { deleteUser, initialiseTestRequestMaker } from '@tests/utilities'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import type { CreateAccountPOSTbody, CreateAccountPOSTresponse } from './route'

const makeRequest = initialiseTestRequestMaker({
	basePath: '/authentication/create-account',
	method: 'POST',
})

const validBody: CreateAccountPOSTbody = {
	firstName: 'Jericha',
	lastName: 'Domain',
	businessName: `Jericha's Joke Shop`,
	email: 'jericha@gmail.com',
	password: 'securePassword123',
}

describe('Create account', () => {
	describe('Status codes', () => {
		beforeAll(async () => await deleteUser(validBody.email))
		afterAll(async () => await deleteUser(validBody.email))

		type Suite = {
			expectedStatus: number
			cases: Case[]
		}

		type Case = {
			caseDescription: string
			body?: JsonData
		}

		const statusSuites: Suite[] = [
			{
				expectedStatus: 400,
				cases: [
					{
						caseDescription: 'Body missing',
						body: undefined,
					},
					{
						caseDescription: 'Empty body',
						body: {},
					},
					{
						caseDescription: 'First name only',
						body: { firstName: 'Jason' },
					},
					{
						caseDescription: 'Last name only',
						body: { lastName: 'Jason' },
					},
					{
						caseDescription: 'First name with @',
						body: { lastName: 'J@son' },
					},
					{
						caseDescription: 'Invalid email',
						body: {
							...validBody,
							email: 'invalid@gmail',
						},
					},
					{
						caseDescription: 'First name contains @',
						body: {
							...validBody,
							firstName: 'n@me',
						},
					},
					{
						caseDescription: 'First name contains >',
						body: {
							...validBody,
							firstName: 'n>me',
						},
					},
					{
						caseDescription: 'Password too short',
						body: {
							...validBody,
							password: 'short',
						},
					},
					{
						caseDescription: 'Password too long',
						body: {
							...validBody,
							// cspell: disable-next-line
							password: 'loremipsumdolorsitametconsectes', // 31 characters
						},
					},
				],
			},
			{
				expectedStatus: 201,
				cases: [
					{
						caseDescription: 'Successful request',
						body: validBody,
					},
				],
			},
			{
				expectedStatus: 409,
				cases: [
					{
						caseDescription: 'Duplicate request',
						body: validBody,
					},
				],
			},
		]

		for (const { expectedStatus, cases } of statusSuites) {
			describe(`Returns ${expectedStatus}`, async () => {
				for (const { caseDescription, body } of cases) {
					test(caseDescription, async () => {
						const { response } = await makeRequest({ body })
						expect(response.status).toBe(expectedStatus)
					})
				}
			})
		}
	})

	describe('Success', () => {
		let jsonResponse: CreateAccountPOSTresponse
		let browserSafeCompositeUser: BrowserSafeCompositeUser | undefined

		beforeAll(async () => {
			await deleteUser(validBody.email)
			const data = await makeRequest({ body: validBody })
			jsonResponse = (await data.response.json()) as CreateAccountPOSTresponse
			browserSafeCompositeUser = jsonResponse.user
		})

		afterAll(async () => await deleteUser(validBody.email))

		type AssertionCase = {
			caseDescription: string
			assertions: AsyncFunction
		}

		describe('JSON body', () => {
			const jsonBodyAssertions: AssertionCase[] = [
				{
					caseDescription: "JSON response has a 'user' property",
					assertions: async () => {
						expect(jsonResponse).toHaveProperty('user')
					},
				},
				{
					caseDescription: 'user.emailConfirmed is false',
					assertions: async () => {
						expect(browserSafeCompositeUser?.emailConfirmed).toBeFalsy()
					},
				},
				{
					caseDescription: 'user.roles is merchant',
					assertions: async () => {
						expect(browserSafeCompositeUser?.roles).toEqual('merchant')
					},
				},
				{
					caseDescription: 'user.activeSubscriptionOrTrial is true',
					assertions: async () => {
						expect(browserSafeCompositeUser?.activeSubscriptionOrTrial).toBeTruthy()
					},
				},
				{
					caseDescription: 'user.hashedPassword is undefined',
					assertions: async () => {
						expect(Object.prototype.hasOwnProperty.call(browserSafeCompositeUser, 'hashedPassword')).toBe(false)
					},
				},
				{
					caseDescription: 'user.password is undefined',
					assertions: async () => {
						expect(Object.prototype.hasOwnProperty.call(browserSafeCompositeUser, 'password')).toBe(false)
					},
				},
			]
			for (const { caseDescription, assertions } of jsonBodyAssertions) {
				test(caseDescription, async () => {
					await assertions()
				})
			}
		})

		describe('Database assertions', () => {
			let databaseQueryArray: Array<unknown>
			let userId: number

			const _databaseAssertions: AssertionCase[] = [
				{
					caseDescription: 'user exists',
					assertions: async () => {
						databaseQueryArray = await database.select().from(users).where(equals(users.email, validBody.email))

						// Retrieve the userId for subsequent tests
						userId = (databaseQueryArray[0] as DangerousBaseUser).id
						if (!userId) throw new Error('User ID not found')
					},
				},
				{
					caseDescription: 'freeTrial exists',
					assertions: async () => {
						databaseQueryArray = await database.select().from(freeTrials).where(equals(freeTrials.userId, userId))
					},
				},
				{
					caseDescription: 'confirmationToken exists',
					assertions: async () => {
						databaseQueryArray = await database.select().from(confirmationTokens).where(equals(confirmationTokens.userId, userId))
					},
				},
			]

			for (const { caseDescription, assertions } of _databaseAssertions) {
				test(caseDescription, async () => {
					await assertions()
					expect(databaseQueryArray.length).toBe(1)
				})
			}
		})
	})
})

/* 
pnpm vitest run src/app/api/authentication/create-account
*/
