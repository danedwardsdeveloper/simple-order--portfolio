import { dynamicBaseURL } from '@/library/environment/publicVariables'
import fetch, { type Response } from 'node-fetch'
import { describe, expect, test } from 'vitest'

async function makeRequest(body: unknown): Promise<{ response: Response; cookies: string | null }> {
	const response = await fetch(`${dynamicBaseURL}/api/cookie-test`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	})
	const cookies = response.headers.get('set-cookie')
	return { response, cookies }
}

describe('Password test', () => {
	test('empty body', async () => {
		const { response, cookies } = await makeRequest({})

		expect(response.status).toBe(400)
		expect(cookies).toBeNull()
	})

	test('incorrect parameter', async () => {
		const { response, cookies } = await makeRequest({
			// cspell: disable
			pasword: 'wrongPassword',
			// cspell: enable
		})
		expect(response.status).toBe(400)
		expect(cookies).toBeNull()
	})

	test('empty password', async () => {
		const { response, cookies } = await makeRequest({ password: '' })
		expect(response.status).toBe(400)
		expect(cookies).toBeNull()
	})

	test('wrong password', async () => {
		const { response, cookies } = await makeRequest({ password: 'wrongPassword' })
		expect(response.status).toBe(401)
		expect(cookies).toBeNull()
	})

	test('Create a cookie with the correct password', async () => {
		const { response, cookies } = await makeRequest({ password: 'secretPassword69' })
		expect(response.status).toBe(200)
		expect(cookies).toBeDefined()
		expect(cookies).toContain('token=')
	})
})

/* 
pnpm vitest src/app/api/cookie-test
*/
