import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import logger from '../logger'

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'simple_order_dev',
})

export async function testDatabaseConnection() {
  try {
    await pool.query('SELECT 1')
    logger.info('Success testing database connection')
  } catch (error) {
    logger.error('Database connection test failed:', error)
  }
}

export const database = drizzle(pool)
