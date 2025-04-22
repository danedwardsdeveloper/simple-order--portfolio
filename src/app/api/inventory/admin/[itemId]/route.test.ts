import { cookieDurations } from '@/library/constants'
import { database } from '@/library/database/connection'
import { products } from '@/library/database/schema'
import { developmentBaseURL } from '@/library/environment/publicVariables'
import { createCookieWithToken } from '@/library/utilities/server'
import type { ProductInsertValues, TestUserInputValues } from '@/types'
import { createUser, deleteUser, parseTokenCookie } from '@tests/utilities'
import fetch from 'node-fetch'
import urlJoin from 'url-join'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { cases } from './testCases'

// ToDo: refactor initialiseRequestMaker so that it accepts a URL parameter
async function makeRequest(requestCookie?: string | undefined, itemId?: number) {
	const baseUrl = urlJoin(developmentBaseURL, '/api/inventory/admin/')
	const url = itemId ? urlJoin(baseUrl, String(itemId)) : baseUrl
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	}
	if (requestCookie) headers.Cookie = requestCookie

	const response = await fetch(url, {
		method: 'DELETE',
		headers,
	})

	const cookieHeader = response.headers.get('set-cookie')
	const setCookie = cookieHeader ? parseTokenCookie(cookieHeader) : null

	return { response, setCookie }
}

describe('Delete inventory item', () => {
	const juliaDavis: TestUserInputValues = {
		firstName: 'Julia',
		lastName: 'Davis',
		businessName: 'Hush Ho Productions',
		email: 'juliadavis@gmail.com',
		password: 'sally4eva',
		emailConfirmed: true,
		cachedTrialExpired: false,
	}

	let validItemId: undefined | number = undefined
	let validRequestCookie: undefined | string = undefined

	beforeAll(async () => {
		await deleteUser(juliaDavis.email)

		const { createdUser } = await createUser(juliaDavis)

		const cookieObject = createCookieWithToken(createdUser.id, cookieDurations.oneYear)
		validRequestCookie = `${cookieObject.name}=${cookieObject.value}`

		const productInsertValues: ProductInsertValues = {
			name: 'Thrush buns in a thick, dark gravy',
			ownerId: createdUser.id,
			priceInMinorUnits: 500,
		}

		const [createdProduct] = await database.insert(products).values(productInsertValues).returning()

		validItemId = createdProduct.id
	})

	afterAll(async () => await deleteUser(juliaDavis.email))

	for (const { description, options, expectedStatus } of cases) {
		test(description, async () => {
			if (!validItemId) throw new Error('Item ID not valid')
			if (!validRequestCookie) throw new Error('Request cookie not valid')

			const itemId = options.itemId.provide ? (options.itemId.useValid ? validItemId : validItemId + 1) : undefined

			const requestCookie = options.cookie.provide ? (options.cookie.useValid ? validRequestCookie : 'ToDo') : undefined

			const { response } = await makeRequest(requestCookie, itemId)
			expect(response.status).toEqual(expectedStatus)
		})
	}
})

/* 
pnpm vitest src/app/api/inventory/admin/\[itemId\]
*/
