import type { Response } from 'node-fetch'
import type { ParsedSetCookie } from './cookies'

export type NodeFetchResponse = Response

export interface TestRequestResponse {
	response: NodeFetchResponse
	setCookie: ParsedSetCookie | null
}
