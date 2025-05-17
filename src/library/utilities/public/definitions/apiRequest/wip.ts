import type { ApiResponse } from '@/types'
import type { JsonData } from '@tests/types'
import type { HTTP_METHOD } from 'next/dist/server/web/http'
import { type CreateApiUrlParams, createApiUrl } from '../createApiUrl'

interface Props<Body = JsonData> extends CreateApiUrlParams {
	includeCredentials?: boolean
	applicationJson?: boolean
	method?: HTTP_METHOD
	body?: Body
}

// ToDo: refactor index.ts like this, enforcing the discriminated union across the codebase (Big job!!)
async function apiRequestNew<Return, Body = JsonData>({
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
	const data = await response.json()

	return {
		...data,
		ok: response.ok,
	} satisfies Return
}

type SuccessCase = { product: string; ok: true }
type FailureCase = { userMessage: string; ok: false }
type TestResponse = ApiResponse<SuccessCase, FailureCase>

const { ok, product, userMessage } = await apiRequestNew<TestResponse>({
	basePath: '/this-is-just-a-test',
})

if (ok) {
	const _productLength = product.length

	// This will error because  "developmentMessage" can't be defined while "ok" is true
	// const devMessageLength = developmentMessage.length
} else {
	const _messageLength = userMessage.length

	// This will error because  "product" can't be defined while "ok" is false
	// const productLength = product.length
}
