import { type CreateApiUrlParams, createApiUrl } from '@/library/utilities/public'
import type { NodeFetchResponse, NodeRequestInit } from '@tests/types'
import type { HTTP_METHOD } from 'next/dist/server/web/http'
import nodeFetch from 'node-fetch'
interface Props extends CreateApiUrlParams {
	// basePath: string
	// domain?: 'production' | 'development' | 'dynamic'
	// segment?: string | number | undefined
	// searchParam?: { key: string; value: string } | undefined
	requestCookie?: string
	applicationJson?: boolean
	method?: HTTP_METHOD
	body?: Record<string, unknown>
}

/**
 * Makes a request to the Simple Order API with good defaults
 * @example
const response = await apiRequest({ basePath: 'orders' })

const _exampleProps: Props = {
    basePath: 'orders',
    segment: '14',
    searchParam: { key: 'limit', value: '10' },
    applicationJson: true,
    method: 'POST',
    body: {
        product: 'Cheese',
    },
}
 */
export async function apiTestRequest({
	basePath,
	requestCookie,
	segment,
	searchParam,
	applicationJson = true,
	method = 'GET',
	body,
}: Props): Promise<NodeFetchResponse> {
	const url = createApiUrl({
		domain: 'development',
		basePath,
		segment,
		searchParam,
	})

	const headers: Record<string, string> = {}
	if (applicationJson) headers['Content-Type'] = 'application/json'
	if (requestCookie) headers.Cookie = requestCookie

	const options: NodeRequestInit = {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined,
	}

	return await nodeFetch(url, options)
}
