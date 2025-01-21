import { requireVariable } from './requireVariable'

export const serverVariables: { [key: string]: string } = {
  databaseUrl: requireVariable('DATABASE_URL'),
  jwtSecret: requireVariable('JWT_SECRET'),
}
