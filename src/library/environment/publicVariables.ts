export const isProduction = process.env.NODE_ENV === 'production'
export const isDevelopment = process.env.NODE_ENV === 'development'

export const bareFlyDomain = 'bare-domain.fly.dev'
export const bareCustomDomain = 'bare-domain.co.uk'
export const productionBaseURL = `https://${bareCustomDomain}`
export const developmentBaseURL = 'http://localhost:3000'
export const dynamicBaseURL = isProduction ? productionBaseURL : developmentBaseURL
