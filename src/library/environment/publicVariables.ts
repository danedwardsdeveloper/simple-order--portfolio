export const isProduction = process.env.NODE_ENV === 'production'
export const isDevelopment = process.env.NODE_ENV === 'development'

export const developmentDatabaseString = 'postgresql://localhost/simple_order_dev'

export const emailSenderDomain = 'simpleorder.co.uk'
export const bareProductionDomain = 'www.simpleorder.co.uk'

export const productionBaseURL = `https://${bareProductionDomain}`
export const developmentBaseURL = 'http://localhost:3000'
export const dynamicBaseURL = isProduction ? productionBaseURL : developmentBaseURL

export const stripePublishableKey =
	// cspell:disable-next-line
	'pk_test_51QvcWRKCyKQPfgmWcdvr4AWoY3HwbgPViqUrv3looVKibsXIaIJmBThSKOJ2t3086yaIp5BTlJ8XRREMm3qOjMHA00crLYOXlI'
