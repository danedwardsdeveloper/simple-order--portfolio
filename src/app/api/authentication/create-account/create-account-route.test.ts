import { dynamicBaseURL } from '@/library/environment/publicVariables'
import fetch from 'node-fetch'
import { describe, expect, test } from 'vitest'
import type { CreateAccountPOSTbody } from './route'

const endpoint = `${dynamicBaseURL}/api/authentication/create-account`

const validBody: CreateAccountPOSTbody = {
	firstName: 'Jericha',
	lastName: 'Domain',
	businessName: `Jericha's Joke Shop`,
	email: 'jericha@gmail.com',
	password: 'securePassword123',
}

describe('Deliberate fails', () => {
	test('No body', async () => {
		const response = await fetch(endpoint, {
			method: 'POST',
		})
		expect(response.status).toBe(500)
	})

	test('Empty body', async () => {
		const response = await fetch(endpoint, {
			method: 'POST',
			body: JSON.stringify({}),
		})
		expect(response.status).toBe(400)
	})

	test('firstName only', async () => {
		const response = await fetch(endpoint, {
			method: 'POST',
			body: JSON.stringify({ firstName: 'Jason' }),
		})
		expect(response.status).toBe(400)
	})

	test('lastName only', async () => {
		const response = await fetch(endpoint, {
			method: 'POST',
			body: JSON.stringify({ lastName: 'Jason' }),
		})
		expect(response.status).toBe(400)
	})

	test('invalidEmail', async () => {
		const body = {
			...validBody,
			email: 'invalid@gmail',
		}
		const response = await fetch(endpoint, {
			method: 'POST',
			body: JSON.stringify(body),
		})
		expect(response.status).toBe(400)
	})

	test('firstName contains @', async () => {
		const body = {
			...validBody,
			firstName: 'n@me',
		}
		const response = await fetch(endpoint, {
			method: 'POST',
			body: JSON.stringify(body),
		})
		expect(response.status).toBe(400)
	})

	test('firstName contains >', async () => {
		const body = {
			...validBody,
			firstName: 'n>me',
		}
		const response = await fetch(endpoint, {
			method: 'POST',
			body: JSON.stringify(body),
		})
		expect(response.status).toBe(400)
	})
})

/* 
pnpm vitest run src/app/api/authentication/create-account
*/
