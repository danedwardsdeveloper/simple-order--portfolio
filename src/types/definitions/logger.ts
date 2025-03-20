import type { logLevels } from '@/library/constants/definitions/logger'

export type LogLevel = keyof typeof logLevels
export type LogVerb = 'debug' | 'info' | 'success' | 'warn' | 'error'
