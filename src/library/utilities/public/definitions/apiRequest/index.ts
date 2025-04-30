import type {} from '@/app/api/invitations/[token]/route'
import type { HTTP_METHOD } from 'next/dist/server/web/http'
import { type CreateApiUrlParams, createApiUrl } from '../createApiUrl'

interface Props<Body = unknown> extends CreateApiUrlParams {
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
 * Makes a type-safe request to the Simple Order API with good defaults
 * - Handles URL segments and search params too
 * The returned object is typed
 * - Add a second type argument to type the body
 * @example
const { userMessage, senderDetails, createdUser } = await apiRequest<RouteResponse, RouteBody>({
	basePath: '/invitations',
	segment: 43,
	method: 'PATCH',
	body: {
		firstName: '',
		lastName: '',
		businessName: '',
		password: ''
	},
})
 */
export async function apiRequest<Return, Body = Record<string, unknown>>({
	domain = 'dynamic',
	basePath,
	segment,
	searchParam,
	includeCredentials = true,
	applicationJson = true,
	method = 'GET',
	body,
}: Props<Body>): Promise<Return> {
	if (typeof window === 'undefined') throw new Error('Attempted to use fetch on the server. Use node-fetch instead')

	const url = createApiUrl({ domain, basePath, segment, searchParam })

	const options: RequestInit = {
		method,
		headers: applicationJson ? { 'Content-Type': 'application/json' } : {},
		body: body ? JSON.stringify(body) : undefined,
		credentials: includeCredentials ? 'include' : 'omit',
	}

	const response = await fetch(url, options)
	return (await response.json()) as Return
}
