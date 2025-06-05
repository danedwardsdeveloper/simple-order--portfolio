export type ApiResponse<Success extends { ok: true }, Failure extends { ok: false }> =
	| (Success & { [k in Exclude<keyof Failure, keyof Success | 'ok'>]?: never })
	| (Failure & { [k in Exclude<keyof Success, keyof Failure | 'ok'>]?: never })

export type DiscriminatedUnion<T1, T2> =
	| (T1 & { [k in Exclude<keyof T2, keyof T1>]?: never })
	| (T2 & { [k in Exclude<keyof T1, keyof T2>]?: never })

export type LinkDetail = {
	displayText: string
	href: string
}

export type DualPriority = 'primary' | 'secondary'
export type TriplePriority = DualPriority | 'tertiary'

export type JsonData = { [key: string]: unknown }

export type NonEmptyArray<T> = [T, ...T[]]

export type FetchHeaders = {
	'Content-Type'?: 'application/json' | 'text/html' | 'multipart/form-data' | 'application/pdf'
	Authorization?: string
	Accept?: string
	'Cache-Control'?: string
	'User-Agent'?: string
	Referer?: string
	Origin?: string
	'X-Requested-With'?: string
	'Accept-Language'?: string
	'Accept-Encoding'?: string
	'Content-Length'?: string
	'Content-Disposition'?: string
	'Set-Cookie'?: string
	Cookie?: string
	Location?: string
	ETag?: string
	'Last-Modified'?: string
	'If-None-Match'?: string
	'If-Modified-Since'?: string
	'Access-Control-Allow-Origin'?: string
	'Access-Control-Allow-Methods'?: string
	'Access-Control-Allow-Headers'?: string
}
