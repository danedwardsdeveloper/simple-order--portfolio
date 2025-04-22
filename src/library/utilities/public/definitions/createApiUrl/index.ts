import { developmentBaseURL, dynamicBaseURL, productionBaseURL } from '@/library/environment/publicVariables'
import urlJoin from 'url-join'

export interface CreateApiUrlParams {
	domain?: 'production' | 'development' | 'dynamic'
	basePath: string
	segment?: string | number | undefined
	searchParam?: { key: string; value: string } | undefined
}

export function createApiUrl({ domain = 'dynamic', basePath, segment, searchParam }: CreateApiUrlParams): string {
	const resolvedDomain = domain === 'production' ? productionBaseURL : domain === 'development' ? developmentBaseURL : dynamicBaseURL
	const resolvedSegment = segment ? String(segment) : ''

	const url = new URL(urlJoin(resolvedDomain, '/api/', basePath, resolvedSegment))

	if (searchParam) {
		url.searchParams.append(searchParam.key, searchParam.value)
	}

	return url.toString()
}
