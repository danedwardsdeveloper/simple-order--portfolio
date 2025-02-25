import type { LogLevel } from '@/types'

export const isProduction = process.env.NODE_ENV === 'production'
export const isDevelopment = process.env.NODE_ENV === 'development'

export const siteIsLaunched = false

export const bareProductionDomain = 'simple-order.fly.dev'
export const bareLaunchedDomain = 'simpleorder.co.uk'

export const productionBaseURL = `https://${bareProductionDomain}`
export const developmentBaseURL = 'http://localhost:3000'
export const dynamicBaseURL = isProduction ? productionBaseURL : developmentBaseURL

export const serverLogLevel: LogLevel = 'level4debug'
export const browserLogLevel: LogLevel = 'level4debug'

// cspell:disable
export const stripePublishableKey =
	'pk_test_51QvcWRKCyKQPfgmWcdvr4AWoY3HwbgPViqUrv3looVKibsXIaIJmBThSKOJ2t3086yaIp5BTlJ8XRREMm3qOjMHA00crLYOXlI'
// cspell:enable
