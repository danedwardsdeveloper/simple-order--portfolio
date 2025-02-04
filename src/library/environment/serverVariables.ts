import { requireVariable } from './requireVariable'

export const jwtSecret = requireVariable('JWT_SECRET')
export const mailgunKey = requireVariable('MAILGUN_KEY')
export const myPersonalEmail = requireVariable('MY_PERSONAL_EMAIL')
