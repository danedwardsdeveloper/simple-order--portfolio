import { isProduction } from '@/library/environment/publicVariables'
import logger from '@/library/logger'
import type { ApiResponse } from '@/types'
import { NextResponse } from 'next/server'

/**
 * @deprecated
 * @returns A function that creates a NextResponse that adds the developmentMessage to the response body in development only.
 */
export function initialiseResponder<T>() {
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

		if (developmentMessage) {
			if (status.toString().includes('20')) {
				logger.success(developmentMessage)
			} else {
				logger.error(developmentMessage)
			}
		}

		const responseBody = {
			...body,
			...(isProduction || !developmentMessage ? {} : { developmentMessage }),
		} as T

		return NextResponse.json(responseBody, { status })
	}
}

export function initialiseResponderNew<Success extends { ok: true }, Failure extends { ok: false }>() {
	return function respond(
		params:
			| {
					body: Omit<Success, 'ok' | 'developmentMessage'>
					status: 200 | 201 | 202 | 204
					developmentMessage?: string
					caughtError?: unknown | Error
			  }
			| {
					body: Omit<Failure, 'ok' | 'developmentMessage'>
					status: Exclude<number, 200 | 201 | 202 | 204>
					developmentMessage?: string
					caughtError?: unknown | Error
			  },
	): NextResponse<ApiResponse<Success, Failure>> {
		const { body, status, developmentMessage, caughtError } = params

		if (caughtError && caughtError instanceof Error) {
			logger.error('Caught error: ', caughtError.message)
		}

		if (developmentMessage) {
			if (status.toString().startsWith('2')) {
				logger.success(developmentMessage)
			} else {
				logger.error(developmentMessage)
			}
		}

		const isSuccess = status.toString().startsWith('2')

		const responseBody = {
			...body,
			ok: isSuccess,
			...(isProduction || !developmentMessage ? {} : { developmentMessage }),
		} as ApiResponse<Success, Failure>

		return NextResponse.json(responseBody, { status })
	}
}
