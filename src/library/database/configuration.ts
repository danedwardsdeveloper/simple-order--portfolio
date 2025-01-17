import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import { databaseUrl } from '../environment/serverVariables'
import logger from '../logger'

const pool = new Pool({
  connectionString: databaseUrl,
})

export async function testDatabaseConnection() {
  try {
    await pool.query('SELECT 1')
    logger.info('Database connected successfully')
  } catch (error) {
    logger.error('Failed to connect to database:', error)
  }
}

export const db = drizzle(pool)
