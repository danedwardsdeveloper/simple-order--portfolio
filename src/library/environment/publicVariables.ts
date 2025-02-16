import type { LogLevel } from '@/types'

export const isProduction = process.env.NODE_ENV === 'production'
export const isDevelopment = process.env.NODE_ENV === 'development'

export const bareDomain = 'simple-order.fly.dev'
export const productionBaseURL = `https://${bareDomain}`
export const developmentBaseURL = 'http://localhost:3000'
export const dynamicBaseURL = isProduction ? productionBaseURL : developmentBaseURL

export const serverLogLevel: LogLevel = 'level1error'
export const browserLogLevel: LogLevel = isProduction ? 'level0none' : 'level4debug'
