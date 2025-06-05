import type { ParsedSetCookie } from '@/types'
import { initialiseTestRequestMaker } from '@tests/utilities'
import { describe, expect, test } from 'vitest'

interface Suite {
	description: string
	expectedStatus: number
	expectedSetCookie: ParsedSetCookie | null
	cases: Case[]
}

interface Case {
	description: string
	// biome-ignore lint/complexity/noBannedTypes:
	body?: {}
	requestCookie?: string
}

const suites: Suite[] = [
	{
		description: 'Bad requests',
		expectedStatus: 400,
		expectedSetCookie: null,
		cases: [
			{ description: 'Nothing provided' }, //
			{ description: 'Empty body provided', body: {} },
			{ description: 'No cookie provided' },
		],
	},
	{
		description: 'Success',
		expectedStatus: 200,
		expectedSetCookie: {
			expires: new Date('1970-01-01T00:00:00.000Z'),
			name: 'token',
			path: '/',
			value: '',
		},
		cases: [
			{
				description: 'Token cookie provided',
				requestCookie:
					// cspell:disable-next-line
					'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c; Path=/; HttpOnly; Secure; SameSite=Strict',
			},
		],
	},
]

const makeRequest = initialiseTestRequestMaker({
	basePath: '/authentication/sign-out',
	method: 'POST',
})

describe('Sign out', () => {
	for (const { description, cases, expectedStatus, expectedSetCookie } of suites) {
		describe(description, () => {
			for (const { description, body, requestCookie } of cases) {
				test(description, async () => {
					const { response, setCookie } = await makeRequest({ body, requestCookie })
					expect(response.status).toBe(expectedStatus)
					expect(setCookie).toStrictEqual(expectedSetCookie)
				})
			}
		})
	}
})

/* 
pnpm vitest src/app/api/authentication/sign-out
*/
