import { dynamicBaseURL } from '@/library/environment/publicVariables'
import fetch from 'node-fetch'
import { describe, expect, test } from 'vitest'

const endpoint = `${dynamicBaseURL}/api/cookie-test`

describe('Password test', () => {
	test('empty body', async () => {
		const response = await fetch(endpoint, {
			method: 'POST',
			body: JSON.stringify({}),
		})
		const cookies = response.headers.get('set-cookie')

		expect(response.status).toBe(400)
		expect(cookies).toBeNull()
	})

	test('incorrect parameter', async () => {
		const response = await fetch(endpoint, {
			method: 'POST',
			// cspell: disable
			body: JSON.stringify({ pasword: 'wrongPassword' }),
			// cspell: enable
		})
		const cookies = response.headers.get('set-cookie')

		expect(response.status).toBe(400)
		expect(cookies).toBeNull()
	})

	test('empty password', async () => {
		const response = await fetch(endpoint, {
			method: 'POST',
			body: JSON.stringify({ password: '' }),
		})
		const cookies = response.headers.get('set-cookie')

		expect(response.status).toBe(400)
		expect(cookies).toBeNull()
	})

	test('wrong password', async () => {
		const response = await fetch(endpoint, {
			method: 'POST',
			body: JSON.stringify({ password: 'wrongPassword' }),
		})
		const cookies = response.headers.get('set-cookie')

		expect(response.status).toBe(401)
		expect(cookies).toBeNull()
	})

	test('Create a cookie with the correct password', async () => {
		const response = await fetch(endpoint, {
			method: 'POST',
			body: JSON.stringify({ password: 'secretPassword69' }),
		})
		const cookies = response.headers.get('set-cookie')

		expect(response.status).toBe(200)
		expect(cookies).toBeDefined()
		expect(cookies).toContain('token=')
	})
})

/* 
pnpm vitest src/app/api/cookie-test
*/
