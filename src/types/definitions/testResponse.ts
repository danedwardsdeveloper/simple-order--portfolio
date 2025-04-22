import type { RequestInit, Response } from 'node-fetch'
import type { ParsedSetCookie } from './cookies'

export type NodeFetchResponse = Response
export type NodeRequestInit = RequestInit

export interface TestRequestResponse {
	response: NodeFetchResponse
	setCookie: ParsedSetCookie | null
}
