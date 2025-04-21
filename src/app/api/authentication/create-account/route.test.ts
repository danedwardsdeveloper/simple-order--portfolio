import { deleteUserSequence } from '@/library/database/operations'
import { initialiseRequestMaker } from '@tests/utilities'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import type { CreateAccountPOSTbody } from './route'

const makeRequest = initialiseRequestMaker({
	path: '/authentication/create-account',
	method: 'POST',
})

const validBody: CreateAccountPOSTbody = {
	firstName: 'Jericha',
	lastName: 'Domain',
	businessName: `Jericha's Joke Shop`,
	email: 'jericha@gmail.com',
	password: 'securePassword123',
}

const testRequests: { name: string; content: unknown; expectedStatus: number }[] = [
	{
		name: 'Body missing',
		content: undefined,
		expectedStatus: 400,
	},
	{
		name: 'Empty body',
		content: {},
		expectedStatus: 400,
	},
	{
		name: 'First name only',
		content: { firstName: 'Jason' },
		expectedStatus: 400,
	},
	{
		name: 'Last name only',
		content: { lastName: 'Jason' },
		expectedStatus: 400,
	},
	{
		name: 'First name with @',
		content: { lastName: 'J@son' },
		expectedStatus: 400,
	},
	{
		name: 'Invalid email',
		content: {
			...validBody,
			email: 'invalid@gmail',
		},
		expectedStatus: 400,
	},
	{
		name: 'First name contains @',
		content: {
			...validBody,
			firstName: 'n@me',
		},
		expectedStatus: 400,
	},
	{
		name: 'First name contains >',
		content: {
			...validBody,
			firstName: 'n>me',
		},
		expectedStatus: 400,
	},
	{
		name: 'Password too short',
		content: {
			...validBody,
			password: 'short',
		},
		expectedStatus: 400,
	},
	{
		name: 'Password too long',
		content: {
			...validBody,
			// cspell: disable-next-line
			password: 'loremipsumdolorsitametconsectes', // 31 characters
		},
		expectedStatus: 400,
	},
	{
		name: 'Successful request',
		content: validBody,
		expectedStatus: 201,
	},
	{
		name: 'Duplicate request',
		content: validBody,
		expectedStatus: 409,
	},
]

describe('Create account', () => {
	beforeAll(async () => {
		await deleteUserSequence(validBody.email)
		await new Promise((resolve) => setTimeout(resolve, 2000))
	})

	afterAll(async () => {
		await deleteUserSequence(validBody.email)
	})

	for (const testRequest of testRequests) {
		test(testRequest.name, async () => {
			const { response } = await makeRequest({ body: testRequest.content })
			expect(response.status).toBe(testRequest.expectedStatus)
		})
	}
})

/* 
pnpm vitest run src/app/api/authentication
*/
