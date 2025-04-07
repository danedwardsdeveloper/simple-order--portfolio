import fetch, { type Response } from 'node-fetch'

export type RequestMaker<BodyType = unknown> = ({
	body,
	cookie,
}: { body?: BodyType; cookie?: string }) => Promise<{ response: Response; cookies: string | null }>

export function initialiseRequestMaker<BodyType = unknown>({
	url,
	method,
}: {
	url: string
	method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
	cookie?: string
}): RequestMaker<BodyType> {
	return async ({ body, cookie }: { body?: BodyType; cookie?: string }): Promise<{ response: Response; cookies: string | null }> => {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		}

		if (cookie) headers.Cookie = cookie

		const response = await fetch(url, {
			method,
			headers,
			...(method !== 'GET' && body !== undefined ? { body: JSON.stringify(body) } : {}),
		})
		const cookies = response.headers.get('set-cookie')
		return { response, cookies }
	}
}

export type GETRequestMaker = (cookie?: string) => Promise<{ response: Response; cookies: string | null }>

export function initialiseGETRequestMaker({
	url,
}: {
	url: string
	cookie?: string
}): GETRequestMaker {
	return async (cookie?: string): Promise<{ response: Response; cookies: string | null }> => {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		}

		if (cookie) headers.Cookie = cookie

		const response = await fetch(url, {
			headers,
		})
		const cookies = response.headers.get('set-cookie')
		return { response, cookies }
	}
}
