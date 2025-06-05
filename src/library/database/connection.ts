import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { developmentDatabaseString, isProduction } from '../environment/publicVariables'
import { productionDatabaseString } from '../environment/serverVariables'
import logger from '../logger'
import * as schema from './schema'

export const database = drizzle(isProduction ? productionDatabaseString : developmentDatabaseString, { schema })

export const developmentDatabase = drizzle(developmentDatabaseString, { schema })

export async function testDatabaseConnection() {
	try {
		await database.execute(sql`SELECT 1`)
		logger.info(`Successfully connected to ${isProduction ? 'production' : 'local'} database`)
	} catch (error) {
		logger.error('Database connection test failed:', error)
	}
}
