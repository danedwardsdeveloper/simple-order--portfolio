import { isProduction } from '@/library/environment/publicVariables'
import logger from '@/library/logger'
import { NextResponse } from 'next/server'

/**
 * @returns A function that creates a NextResponse that adds the developmentMessage to the response body in development only.
 */
export function initialiseResponder<T extends object>() {
	return function createResponse({
		body,
		status,
		developmentMessage,
		caughtError,
	}: {
		body?: Omit<T, 'developmentMessage'>
		status: number
		developmentMessage?: string
		caughtError?: unknown | Error
	}): NextResponse<T> {
		if (caughtError && caughtError instanceof Error) {
			logger.error('Caught error: ', caughtError.message)
		}

		if (status.toString().includes('20')) {
			logger.success(developmentMessage)
		} else {
			logger.error(developmentMessage)
		}

		const responseBody = {
			...body,
			...(isProduction || !developmentMessage ? {} : { developmentMessage }),
		} as T

		return NextResponse.json(responseBody, { status })
	}
}
