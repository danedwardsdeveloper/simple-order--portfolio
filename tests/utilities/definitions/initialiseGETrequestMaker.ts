import { developmentBaseURL } from '@/library/environment/publicVariables'
import type { TestRequestResponse } from '@/types'
import fetch from 'node-fetch'
import urlJoin from 'url-join'
import { parseTokenCookie } from './parseCookies'

type GETRequestMaker = (cookie?: string) => Promise<TestRequestResponse>

/**
 * @param path Just the end of the path, like /users
 * @example
const makeRequest = initialiseGETRequestMaker('/users');
 */
export function initialiseGETRequestMaker(path: string): GETRequestMaker {
	return async (requestCookie?: string): Promise<TestRequestResponse> => {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		}

		if (requestCookie) headers.Cookie = requestCookie

		const url = urlJoin(developmentBaseURL, '/api', path)

		const response = await fetch(url, {
			headers,
		})

		const cookieHeader = response.headers.get('set-cookie')
		const setCookie = cookieHeader ? parseTokenCookie(cookieHeader) : null

		return { response, setCookie }
	}
}
