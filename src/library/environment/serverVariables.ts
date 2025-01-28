import { requireVariable } from './requireVariable'

export const jwtSecret = requireVariable('JWT_SECRET')
