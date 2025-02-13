/* eslint-disable no-console */
import chalk from 'chalk'

import { isProduction } from './environment/publicVariables'

type Levels = 'quiet' | 'debug' | 'warn' | 'info'

type LevelMapping = {
  [K in Levels]: number
}

const levelsMap: LevelMapping = {
  quiet: 0,
  debug: 1,
  warn: 2,
  info: 3,
}

const currentLevel: Levels = 'quiet'

const shouldLog = (targetLevel: Levels): boolean => {
  return levelsMap[targetLevel] >= levelsMap[currentLevel]
}

const voidCallback = (): void => {}

const createLoggerMethod = (level: Levels, color: typeof chalk.magenta, consoleMethod: typeof console.debug = console.log) => {
  if (isProduction) return voidCallback

  return (...args: unknown[]): void => {
    if (shouldLog(level)) {
      consoleMethod(color(`[${level.toUpperCase()}]`), ...args)
    }
  }
}

const logger = {
  debug: createLoggerMethod('debug', chalk.magenta, console.debug),
  info: createLoggerMethod('info', chalk.blue, console.info),
  warn: createLoggerMethod('warn', chalk.yellow, console.warn),
  error: (...args: unknown[]): void => console.error(chalk.red('[ERROR]'), ...args),
  errorUnknown: (error: unknown, label: string = 'Unknown error: '): void =>
    console.error(chalk.red('[ERROR]', label, error instanceof Error ? error.message : JSON.stringify(error))),
} as const

export default logger
