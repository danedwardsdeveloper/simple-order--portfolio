import { describe, expect, test } from 'vitest'
import { type CreateApiUrlParams, createApiUrl } from '.'

interface Suite {
	description: string
	cases: Case[]
}

interface Case {
	description: string
	input: CreateApiUrlParams
	expected: string | Error
}

describe('Create URL', () => {
	const suites: Suite[] = [
		{
			description: 'Success cases',
			cases: [
				{
					description: 'Simple path',
					input: {
						basePath: '/authentication/sign-in',
					},
					expected: 'http://localhost:3000/api/authentication/sign-in',
				},
				{
					description: 'Simple path with trailing slash',
					input: {
						basePath: '/authentication/sign-in/',
					},
					expected: 'http://localhost:3000/api/authentication/sign-in',
				},
				{
					description: 'Simple path with no slash',
					input: {
						basePath: 'authentication',
					},
					expected: 'http://localhost:3000/api/authentication',
				},
				{
					description: 'With segment',
					input: {
						basePath: '/orders',
						segment: '1',
					},
					expected: 'http://localhost:3000/api/orders/1',
				},
				{
					description: 'With segment and trailing slash',
					input: {
						basePath: '/orders/',
						segment: '1',
					},
					expected: 'http://localhost:3000/api/orders/1',
				},
				{
					description: 'With search param',
					input: {
						basePath: '/orders/admin',
						searchParam: {
							key: 'limit',
							value: '100',
						},
					},
					expected: 'http://localhost:3000/api/orders/admin?limit=100',
				},
				{
					description: 'With search param and trailing slash',
					input: {
						basePath: '/orders/admin/',
						searchParam: {
							key: 'limit',
							value: '100',
						},
					},
					expected: 'http://localhost:3000/api/orders/admin?limit=100',
				},
				{
					description: 'With search param and segment',
					input: {
						basePath: '/orders/admin/',
						segment: '14',
						searchParam: {
							key: 'limit',
							value: '100',
						},
					},
					expected: 'http://localhost:3000/api/orders/admin/14?limit=100',
				},
			],
		},
		{
			description: 'Production cases',
			cases: [
				{
					description: 'Simple production URL',
					input: {
						domain: 'production',
						basePath: 'verify-token',
					},
					expected: 'https://simple-order-management.vercel.app/api/verify-token',
				},
			],
		},
		{
			description: 'Dynamic cases',
			cases: [
				{
					description: 'Dynamic domain uses localhost',
					input: {
						domain: 'dynamic',
						basePath: 'verify-token',
					},
					expected: 'http://localhost:3000/api/verify-token',
				},
				{
					description: 'Dynamic is the default',
					input: {
						basePath: 'verify-token',
					},
					expected: 'http://localhost:3000/api/verify-token',
				},
			],
		},
	]

	for (const { description, cases } of suites) {
		describe(description, () => {
			for (const { description, input, expected } of cases) {
				test(description, () => {
					if (expected instanceof Error) {
						expect(() => createApiUrl(input)).toThrow()
					} else {
						expect(createApiUrl(input)).toEqual(expected)
					}
				})
			}
		})
	}
})

/* 
pnpm vitest tests/utilities/definitions/createApiUrl
*/
