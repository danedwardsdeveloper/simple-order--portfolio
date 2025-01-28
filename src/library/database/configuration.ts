import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'

import logger from '../logger'

const sqlite = new Database('local.db')

export function testDatabaseConnection() {
  try {
    sqlite.prepare('SELECT 1').get()
    logger.info('Success testing database connection')
  } catch (error) {
    logger.error('Database connection test failed:', error)
  }
}

export const database = drizzle(sqlite)
