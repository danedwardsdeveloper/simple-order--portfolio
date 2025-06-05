import logger from '@/library/logger'

export interface CreateApiUrlParams {
	basePath: string
	segment?: string | number | undefined
	searchParam?: { key: string; value: string } | undefined
}

export function createApiUrl({ basePath, segment, searchParam }: CreateApiUrlParams): string {
	const cleanBasePath = basePath.replace(/^\/+|\/+$/g, '')
	const resolvedSegment = segment ? `/${segment}` : ''

	let path = `/api/${cleanBasePath}${resolvedSegment}`

	if (searchParam) {
		path += `?${searchParam.key}=${encodeURIComponent(searchParam.value)}`
	}

	return path
}

// New!
// Turn this into a package
// simple-api-path is available

export interface CreateApiUrlOptions {
	segments: Array<string | number>
	searchParams?: Record<string, string | number | boolean> | URLSearchParams
	base?: string
	absoluteBase?: string
}

export function createApiUrlNew(options: CreateApiUrlOptions): string {
	options.base = '/api'
	const { segments, searchParams, base } = options

	const pathArray = [base.replace(/\/+$/, '')]

	for (const segment of segments) {
		const cleaned = String(segment).replace(/^\/+|\/+$/g, '')
		if (cleaned) {
			pathArray.push(`/${cleaned}`)
		}
	}

	let path = pathArray.join('')

	if (searchParams) {
		const urlParams = new URLSearchParams()

		if (searchParams instanceof URLSearchParams) {
			path += `?${searchParams.toString()}`
		} else {
			for (const [key, value] of Object.entries(searchParams)) {
				urlParams.append(key, String(value))
			}

			if (urlParams.toString()) {
				path += `?${urlParams.toString()}`
			}
		}
	}

	if (base.includes('api') && String(segments[0]) === 'api') {
		logger.warn(`simple-api-path: "api" duplicated in path: ${path}\n`)
	}

	if (options.absoluteBase) {
		return `${options.absoluteBase}/${path}`
	}

	return path
}
