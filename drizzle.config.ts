import logger from '@/library/logger'
import type { Config } from 'drizzle-kit'

import { developmentDatabaseString, productionDatabaseString } from '@/library/environment/serverVariables'

const useLocalDatabase = true

logger.info(`Using ${useLocalDatabase ? 'local' : 'production'} database`)

export default {
	dialect: 'postgresql',
	schema: './src/library/database/schema.ts',
	out: './drizzle',
	dbCredentials: {
		url: useLocalDatabase ? developmentDatabaseString : productionDatabaseString,
	},
	verbose: true,
	strict: true,
} satisfies Config
