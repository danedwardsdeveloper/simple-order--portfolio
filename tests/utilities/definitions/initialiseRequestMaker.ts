import { developmentBaseURL } from '@/library/environment/publicVariables'
import type { TestRequestResponse } from '@/types'
import fetch from 'node-fetch'
import urlJoin from 'url-join'
import { parseTokenCookie } from './parseCookies'

type RequestMaker<BodyType = unknown> = ({
	body,
	requestCookie,
}: {
	body?: BodyType
	requestCookie?: string
}) => Promise<TestRequestResponse>

/**
 * ToDo: add options for segments
 * @returns A request maker function for API endpoints with a body
 * @param options Configuration for the request maker
 * @param options.path API path WITHOUT http://localhost:3000/api
 * @param options.method HTTP method to use
 */
export function initialiseRequestMaker<BodyType = unknown>({
	path,
	method,
}: {
	path: string
	method: 'POST' | 'PATCH' | 'DELETE'
}): RequestMaker<BodyType> {
	return async ({
		body,
		requestCookie,
	}: {
		body?: BodyType
		requestCookie?: string
	}): Promise<TestRequestResponse> => {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		}

		if (requestCookie) headers.Cookie = requestCookie

		const url = urlJoin(developmentBaseURL, '/api', path)

		const response = await fetch(url, {
			method,
			headers,
			body: JSON.stringify(body),
		})

		const cookieHeader = response.headers.get('set-cookie')
		const setCookie = cookieHeader ? parseTokenCookie(cookieHeader) : null

		return { response, setCookie }
	}
}
