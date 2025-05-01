import { database } from '@/library/database/connection'
import { users } from '@/library/database/schema'
import type { BaseUserBrowserInputValues, BaseUserInsertValues, JsonData, TestRequestResponse } from '@/types'
import { deleteUser, initialiseTestRequestMaker } from '@tests/utilities'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

/*
ToDos:
A valid email that doesn't exist in the database
Rate limiting or brute force protection
Body content testing
401 / 403 logic
*/

const makePOSTrequest = initialiseTestRequestMaker({
	basePath: '/authentication/sign-in',
	method: 'POST',
})

const katyPerry: BaseUserBrowserInputValues = {
	firstName: 'Katy',
	lastName: 'Perry',
	businessName: 'Dark Horse Enterprises Inc.',
	email: 'katyperry@gmail.com',
	password: "K@ty'sSecretPassword123",
}

interface Case {
	description: string
	body: JsonData | undefined
}

interface Suite {
	suiteDescription: string
	expected: number
	cases: Case[]
}

const suites: Suite[] = [
	{
		suiteDescription: 'Incorrect body',
		expected: 400,
		cases: [
			{
				description: 'Missing body',
				body: undefined,
			},
			{
				description: 'Empty body',
				body: {},
			},
			{
				description: 'No email',
				body: {
					password: '',
				},
			},
			{
				description: 'No password, empty email',
				body: {
					email: '',
				},
			},
			{
				description: 'No password',
				body: {
					email: katyPerry.email,
				},
			},
			{
				description: 'Email and password empty strings',
				body: {
					email: '',
					password: '',
				},
			},
			{
				description: 'Invalid email format',
				body: {
					email: 'hello@gmail',
					password: 'securePassword123',
				},
			},
		],
	},
	{
		suiteDescription: 'Returns 404 if password is incorrect',
		expected: 404,
		cases: [
			{
				description: 'Invalid user',
				body: {
					email: katyPerry.email,
					password: 'incorrectPassword',
				},
			},
		],
	},
]

describe('Sign in', () => {
	for (const { suiteDescription, expected, cases } of suites) {
		describe(suiteDescription, () => {
			for (const { description, body } of cases) {
				test(description, async () => {
					const { response } = await makePOSTrequest({ body })
					expect(response.status).toBe(expected)
				})
			}
		})
	}

	describe('Success case', () => {
		let responseObject: TestRequestResponse | null = null
		let katyPerryId: null | number = null

		beforeAll(async () => {
			const insertValues: BaseUserInsertValues = {
				...katyPerry,
				hashedPassword: await bcrypt.hash(katyPerry.password, 10),
				emailConfirmed: true,
				slug: 'dark-horse-enterprises-inc',
			}
			const [katyPerryRow] = await database.insert(users).values(insertValues).returning()
			katyPerryId = katyPerryRow.id

			responseObject = await makePOSTrequest({
				body: {
					email: katyPerry.email,
					password: katyPerry.password,
				},
			})
		})

		afterAll(async () => {
			await deleteUser(katyPerry.email)
		})

		test('Status is 200', () => {
			expect(responseObject?.response.status).toBe(200)
		})

		test('Has a "token" cookie', () => {
			const setCookie = responseObject?.setCookie
			expect(setCookie).toBeDefined()
		})

		test('Cookie is a JWT', () => {
			const value = responseObject?.setCookie?.value
			expect(value).toMatch(/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/)
		})

		test('Decoded cookie value is the user ID', () => {
			const decoded = jwt.decode(responseObject?.setCookie?.value || '')
			expect(String(decoded?.sub)).toBe(String(katyPerryId))
		})
	})
})

/* 
pnpm vitest src/app/api/authentication/sign-in
*/
