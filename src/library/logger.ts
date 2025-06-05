import { isDevelopment } from './environment/publicVariables'

export type LogLevel = keyof typeof logLevels
export type LogVerb = 'debug' | 'info' | 'success' | 'warn' | 'error'

export const serverLogLevel: LogLevel = 'level5debug'
export const browserLogLevel: LogLevel = isDevelopment ? 'level5debug' : 'level5debug'

export const logLevels = {
	level0none: 0,
	level1error: 1,
	level2warn: 2,
	level3success: 3,
	level4info: 4,
	level5debug: 5,
} as const

export const browserColours = {
	debug: 'color: #c084fc', // Purple
	info: 'color: #3498DB', // Blue
	success: 'color: #16a34a', // Green
	warn: 'color: #FFA500', // Orange
	error: 'color: #FF3838', // Red
}

export const serverColors = {
	reset: '\x1b[0m',
	debug: '\x1b[35m', // Magenta
	info: '\x1b[34m', // Blue
	success: '\x1b[32m', // Green
	warn: '\x1b[33m', // Yellow
	error: '\x1b[31m', // Red
} as const

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
		console[verb === 'success' ? 'log' : verb](`\n${serverColors[verb]}${label} ${message}${serverColors.reset}`) // Added new line
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

// ToDo: add this:
// 	logger.error(error instanceof Error ? error.message : 'Unknown error')

const logger = {
	debug: shouldLog('level5debug') ? createLogger('debug', '[DEBUG]') : () => {},
	info: shouldLog('level4info') ? createLogger('info', '[INFO]') : () => {},
	success: shouldLog('level3success') ? createLogger('success', '[SUCCESS]') : () => {},
	warn: shouldLog('level2warn') ? createLogger('warn', '[WARN]') : () => {},
	error: shouldLog('level1error') ? createLogger('error', '[ERROR]') : () => {},
}

export default logger
