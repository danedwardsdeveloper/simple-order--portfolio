import { NextRequest } from 'next/server'
import { describe, expect, test } from 'vitest'
import { type CreateAccountPOSTbody, POST } from './route'

describe('POST /api/authentication/create-account', () => {
	function createTestRequest(body?: CreateAccountPOSTbody): NextRequest {
		return new NextRequest('http://localhost/api/authentication/create-account', {
			method: 'POST',
			body: JSON.stringify(body || {}),
			headers: {
				'Content-Type': 'application/json',
			},
		})
	}

	test('fail with no body', async () => {
		const request = createTestRequest()
		const response = await POST(request)
		expect(response.status).toBe(400)
	})

	const body: CreateAccountPOSTbody = {
		password: '',
		firstName: '',
		lastName: '',
		email: '',
		businessName: '',
	}

	test('fail with all parameters empty', async () => {
		const response = await POST(createTestRequest(body))
		expect(response.status).toBe(400)
	})

	body.firstName = 'Dan'

	test('fail with only firstName', async () => {
		const response = await POST(createTestRequest(body))
		expect(response.status).toBe(400)
	})

	body.lastName = 'Edwards'

	test('fail with only firstName and lastName', async () => {
		const response = await POST(createTestRequest(body))
		expect(response.status).toBe(400)
	})

	body.email = 'myemail@gmail.com'
	body.businessName = 'My@Business'
	body.password = 'securePassword123'

	test('fail with @ in firstName', async () => {
		const response = await POST(createTestRequest(body))
		expect(response.status).toBe(400)
	})
})

/* 
pnpm vitest run src/app/api/authentication/create-account
*/
