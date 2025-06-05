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
					expected: '/api/authentication/sign-in',
				},
				{
					description: 'Simple path with trailing slash',
					input: {
						basePath: '/authentication/sign-in/',
					},
					expected: '/api/authentication/sign-in',
				},
				{
					description: 'Simple path with no slash',
					input: {
						basePath: 'authentication',
					},
					expected: '/api/authentication',
				},
				{
					description: 'With segment',
					input: {
						basePath: '/orders',
						segment: '1',
					},
					expected: '/api/orders/1',
				},
				{
					description: 'With segment and trailing slash',
					input: {
						basePath: '/orders/',
						segment: '1',
					},
					expected: '/api/orders/1',
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
					expected: '/api/orders/admin?limit=100',
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
					expected: '/api/orders/admin?limit=100',
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
					expected: '/api/orders/admin/14?limit=100',
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
pnpm vitest src/library/utilities/public/definitions/createApiUrl
*/
