import { requireVariable } from './requireVariable'

export const databaseUrl = requireVariable('DATABASE_URL')
export const jwtSecret = requireVariable('JWT_SECRET')
