import type { HTTP_METHOD } from 'next/dist/server/web/http'
import { type CreateApiUrlParams, createApiUrl } from '../createApiUrl'

interface Props extends CreateApiUrlParams {
	// basePath: string
	// domain?: 'production' | 'development' | 'dynamic'
	// segment?: string | number | undefined
	// searchParam?: { key: string; value: string } | undefined
	includeCredentials?: boolean
	applicationJson?: boolean
	method?: HTTP_METHOD
	body?: Record<string, unknown>
}

/**
 * Makes a request to the Simple Order API with good defaults
 * @example
const response = await apiRequest({ basePath: 'orders' })

const _exampleProps: Props = {
	domain: 'production',
	basePath: 'orders',
	segment: '14',
	searchParam: { key: 'limit', value: '10' },
	includeCredentials: true,
	applicationJson: true,
	method: 'POST',
	body: {
		product: 'Cheese',
	},
}
 */
export async function apiRequest({
	domain = 'dynamic',
	basePath,
	segment,
	searchParam,
	includeCredentials = true,
	applicationJson = true,
	method = 'GET',
	body,
}: Props): Promise<Response> {
	if (typeof window === 'undefined') throw new Error('Attempted to use fetch on the server. Use node-fetch instead')

	const url = createApiUrl({
		domain,
		basePath,
		segment,
		searchParam,
	})
	const options: RequestInit = {
		method,
		headers: applicationJson ? { 'Content-Type': 'application/json' } : {},
		body: body ? JSON.stringify(body) : undefined,
		credentials: includeCredentials ? 'include' : 'omit',
	}

	return await fetch(url, options)
}
