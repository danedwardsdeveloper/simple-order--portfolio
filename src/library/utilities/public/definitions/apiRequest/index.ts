import type { FetchHeaders, JsonData } from '@/types'
import type { HTTP_METHOD } from 'next/dist/server/web/http'
import { type CreateApiUrlParams, createApiUrl } from '../createApiUrl'

interface Props<Body = JsonData> extends CreateApiUrlParams {
	// basePath: string
	// domain?: 'production' | 'development' | 'dynamic'
	// segment?: string | number | undefined
	// searchParam?: { key: string; value: string } | undefined
	includeCredentials?: boolean
	applicationJson?: boolean
	method?: HTTP_METHOD
	body?: Body
}

/**
 * @deprecated use apiRequestNew instead
 */
export async function apiRequest<Return, Body = Record<string, unknown>>({
	basePath,
	segment,
	searchParam,
	includeCredentials = true,
	applicationJson = true,
	method = 'GET',
	body,
}: Props<Body>): Promise<Return & { ok: boolean }> {
	if (typeof window === 'undefined') throw new Error('Attempted to use fetch on the server. Use node-fetch instead')

	const url = createApiUrl({ basePath, segment, searchParam })

	const options: RequestInit = {
		method,
		headers: applicationJson ? { 'Content-Type': 'application/json' } : {},
		body: body ? JSON.stringify(body) : undefined,
		credentials: includeCredentials ? 'include' : 'omit',
	}

	const response = await fetch(url, options)
	const data = (await response.json()) as Return

	return {
		...data,
		ok: response.ok,
	}
}

/*
Example types
type SuccessCase = { product: string; ok: true }
type FailureCase = { userMessage: string; ok: false }
type TestResponse = ApiResponse<SuccessCase, FailureCase>
*/

/*
Idea...

type RouteConfig = {
	path: string
	method: HTTP_METHOD
}

const verifyTokenConfig: RouteConfig = {
	path: '/authentication/verify-token',
	method: 'GET',
}
*/

export async function apiRequestNew<Return, Body = JsonData>({
	basePath,
	segment,
	searchParam,
	includeCredentials = true,
	applicationJson = true,
	method = 'GET',
	body,
}: Props<Body>): Promise<Return> {
	if (typeof window === 'undefined') {
		throw new Error('Attempted to use fetch on the server. Use node-fetch instead')
	}

	const url = createApiUrl({ basePath, segment, searchParam })

	const options: RequestInit = {
		method,
		headers: applicationJson ? ({ 'Content-Type': 'application/json' } satisfies FetchHeaders) : {},
		body: body ? JSON.stringify(body) : undefined,
		credentials: includeCredentials ? 'include' : 'omit',
	}

	const response = await fetch(url, options)
	const data = await response.json()

	return {
		...data,
		ok: response.ok,
	} satisfies Return
}
