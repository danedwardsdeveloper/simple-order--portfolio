import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { databaseURL } from '../environment/serverVariables'
import logger from '../logger'

export const database = drizzle(databaseURL)

export async function testDatabaseConnection() {
	try {
		await database.execute(sql`SELECT 1`)
		logger.info('Success testing database connection')
	} catch (error) {
		logger.error('Database connection test failed:', error)
	}
}
