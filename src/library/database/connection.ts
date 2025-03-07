import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { isProduction } from '../environment/publicVariables'
import { developmentDatabaseString, productionDatabaseString } from '../environment/serverVariables'
import logger from '../logger'

const connectionString = isProduction ? productionDatabaseString : developmentDatabaseString

export const database = drizzle(connectionString)

export async function testDatabaseConnection() {
	try {
		await database.execute(sql`SELECT 1`)
		logger.info(`Successfully connected to ${isProduction ? 'production' : 'local'} database`)
	} catch (error) {
		logger.error('Database connection test failed:', error)
	}
}
