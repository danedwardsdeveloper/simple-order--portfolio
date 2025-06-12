import { developmentBaseURL } from '@/library/environment/publicVariables'
import { createApiUrl } from '@/library/utilities/public'
import type { TestRequestResponse } from '@tests/types'
import { parseTokenCookie } from '@tests/utilities'
import type { HTTP_METHOD } from 'next/dist/server/web/http'
import fetch from 'node-fetch'
import urlJoin from 'url-join'

type InitialiserOptions = {
	basePath: string
	method: Exclude<HTTP_METHOD, 'GET'>
}

type ReturnedFunctionOptions = {
	requestCookie?: string
	segment?: string | number
	searchParam?: { key: string; value: string }
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	body?: Record<string, unknown> | null | {}
}

type RequestMaker = ({ requestCookie, segment, searchParam, body }: ReturnedFunctionOptions) => Promise<TestRequestResponse>

/**
 * @example
const requestMaker = initialiseTestRequestMaker({
	basePath: '/orders',
	method: 'PATCH',
})

const { response, setCookie } = await requestMaker({
	requestCookie: 'token=123',
	segment: 2,
	body: { status: 'deleted' },
})
 */
export function initialiseTestRequestMaker({ basePath, method }: InitialiserOptions): RequestMaker {
	return async (options?: ReturnedFunctionOptions): Promise<TestRequestResponse> => {
		const headers: Record<string, string> = { 'Content-Type': 'application/json' }
		if (options?.requestCookie) headers.Cookie = options.requestCookie

		const relativePath = createApiUrl({
			basePath,
			segment: options?.segment,
			searchParam: options?.searchParam,
		})

		const url = urlJoin(developmentBaseURL, relativePath)

		const response = await fetch(url, {
			method,
			headers,
			body: options?.body ? JSON.stringify(options.body) : undefined,
		})

		const cookieHeader = response.headers.get('set-cookie')
		const setCookie = cookieHeader ? parseTokenCookie(cookieHeader) : null

		return { response, setCookie }
	}
}
