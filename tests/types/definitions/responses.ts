import type { ParsedSetCookie } from '@/types'
import type { RequestInit, Response } from 'node-fetch'

export type NodeFetchResponse = Response
export type NodeRequestInit = RequestInit

export interface TestRequestResponse {
	response: NodeFetchResponse
	setCookie: ParsedSetCookie | null
}
