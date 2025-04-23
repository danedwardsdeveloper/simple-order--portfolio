import { createApiUrl } from '@/library/utilities/public'
import type { TestRequestResponse } from '@/types'
import { parseTokenCookie } from '@tests/utilities'
import fetch from 'node-fetch'

type ReturnedFunctionOptions = {
	requestCookie?: string
	segment?: string
	searchParam?: { key: string; value: string }
}

/**
 * @example
const getUserDetails = initialiseGETRequestMaker('/users/')

const { response, setCookie } = await getUserDetails({
	requestCookie: 'token=123',
	segment: '42',
	searchParam: {
		key: 'limit',
		value: '10',
	},
})
 */
type GETRequestMaker = ({ requestCookie, segment, searchParam }: ReturnedFunctionOptions) => Promise<TestRequestResponse>

export function initialiseTestGETRequestMaker(basePath: string): GETRequestMaker {
	return async ({ requestCookie, segment, searchParam }: ReturnedFunctionOptions = {}): Promise<TestRequestResponse> => {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		}

		if (requestCookie) {
			headers.Cookie = requestCookie
		}

		const url = createApiUrl({
			basePath,
			segment: segment,
			searchParam: searchParam,
		})

		const response = await fetch(url, {
			headers,
		})

		const cookieHeader = response.headers.get('set-cookie')
		const setCookie = cookieHeader ? parseTokenCookie(cookieHeader) : null

		return { response, setCookie }
	}
}
