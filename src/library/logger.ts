import type { LogLevel, LogVerb } from '@/types'
import { browserColours, logLevels, serverColors } from './constants'
import { browserLogLevel, serverLogLevel } from './environment/publicVariables'

const isServer = typeof window === 'undefined'

const shouldLog = (logLevel: LogLevel) => {
	const currentLevel = isServer ? serverLogLevel : browserLogLevel
	return logLevels[logLevel] <= logLevels[currentLevel]
}

function safeStringify(data: unknown): string {
	if (typeof data === 'string') return data
	if (data instanceof Promise) return 'Unresolved promise. Did you forget to await?'

	try {
		return JSON.stringify(
			data,
			(_key, value) => {
				if (value instanceof Map || value instanceof Set) {
					return {
						__type: value instanceof Map ? 'Map' : 'Set',
						size: value.size,
						...(value instanceof Map ? { entries: Array.from(value.entries()) } : { values: Array.from(value.values()) }),
					}
				}
				return value
			},
			2, // JSON whitespace for nested objects
		)
	} catch {
		return '[Unserializable data]'
	}
}

const stringifyArguments = (...args: unknown[]): string[] => args.map((arg) => (typeof arg === 'string' ? arg : safeStringify(arg)))

const serverLogger = (verb: LogVerb, label: string) => {
	return (...args: unknown[]) => {
		const message = stringifyArguments(...args).join(' ')
		// biome-ignore lint/suspicious/noConsole:
		console[verb === 'success' ? 'log' : verb](`${serverColors[verb]}${label} ${message}${serverColors.reset}`)
	}
}

const browserLogger =
	(verb: LogVerb, label: string) =>
	(...args: unknown[]): void => {
		const style = browserColours[verb]
		const message = stringifyArguments(...args).join(' ')
		// biome-ignore lint/suspicious/noConsole:
		console[verb === 'success' ? 'log' : verb](`%c${label} ${message}`, style)
	}

const createLogger = (type: LogVerb, label: string) => (isServer ? serverLogger(type, label) : browserLogger(type, label))

const logger = {
	debug: shouldLog('level5debug') ? createLogger('debug', '[DEBUG]') : () => {},
	info: shouldLog('level4info') ? createLogger('info', '[INFO]') : () => {},
	success: shouldLog('level3success') ? createLogger('success', '[SUCCESS]') : () => {},
	warn: shouldLog('level2warn') ? createLogger('warn', '[WARN]') : () => {},
	error: shouldLog('level1error') ? createLogger('error', '[ERROR]') : () => {},
}

export default logger
