import { isDevelopment } from '@/library/environment/publicVariables'
import logger from '@/library/logger'
import type { LogLevel } from '@/types'
import type { HTTP_METHOD } from 'next/dist/server/web/http'
import urlJoin from 'url-join'

/**
 * @deprecated use initialiseResponder instead
 */
export function initialiseDevelopmentLogger(path: string, method: HTTP_METHOD) {
	if (path.includes('api')) throw new Error('initialiseDevelopmentLogger: path must not include "api"')
	const fullPath = urlJoin('/api', path)
	const routeSignature = `${method} ${fullPath}: `

	/**
	 * Logs a message and returns it only in development environments
	 *
	 * @param message - The message to log
	 * @param error - Optional error object to log
	 * @param level - Optional log level override
	 * @returns The message in development, undefined in production
	 */
	function developmentLogger(message: string, options?: { error?: Error | unknown; level?: LogLevel }): string | undefined {
		const error = options?.error || null
		const level = options?.level || 'default'

		switch (level) {
			case 'level0none':
				break
			case 'level1error':
				logger.error(routeSignature, message, error)
				break
			case 'level2warn':
				logger.warn(routeSignature, message)
				break
			case 'level3success':
				logger.success(routeSignature, message)
				break
			case 'level4info':
				logger.info(routeSignature, message)
				break
			case 'level5debug':
				logger.debug(routeSignature, message)
				break
			default:
				logger.error(routeSignature, message)
				break
		}

		return isDevelopment ? message : undefined
	}

	return { developmentLogger, routeSignature }
}

/**
 * @deprecated Use initialiseDevelopmentLogger instead. Since 26 March 2025.
 */
export function logAndSanitiseApiResponse({
	routeDetail,
	message,
	level = 'level1error',
	error,
}: { routeDetail: string; message: string; level?: LogLevel; error?: unknown }): string | undefined {
	switch (level) {
		case 'level0none':
			break
		case 'level1error':
			logger.error(routeDetail, message, error)
			break
		case 'level2warn':
			logger.warn(routeDetail, message)
			break
		case 'level3success':
			logger.success(routeDetail, message)
			break
		case 'level4info':
			logger.info(routeDetail, message)
			break
		default:
			logger.debug(routeDetail, message)
			break
	}

	return isDevelopment ? message : undefined
}

/**
 * @deprecated Use initialiseDevelopmentLogger instead. Since 26 March 2025.
 */
export function logAndSanitiseApiError({ routeDetail, error }: { routeDetail: string; error: unknown }): unknown {
	logger.error(routeDetail, error)
	const developmentError = error instanceof Error ? error.message : 'unknown error'
	return isDevelopment ? developmentError : undefined
}
