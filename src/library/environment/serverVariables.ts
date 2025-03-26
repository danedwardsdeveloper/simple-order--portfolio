import { requireVariable } from './requireVariable'

export const productionDatabaseString = requireVariable('PRODUCTION_DATABASE_STRING')

export const jwtSecret = requireVariable('JWT_SECRET')

export const mailgunKey = requireVariable('MAILGUN_KEY')
export const myPersonalEmail = requireVariable('MY_PERSONAL_EMAIL')

export const stripeKey = requireVariable('STRIPE_KEY')
export const stripeTestKey = requireVariable('STRIPE_TEST_KEY')
export const stripeWebhookSecret = requireVariable('STRIPE_WEBHOOK_SECRET')
