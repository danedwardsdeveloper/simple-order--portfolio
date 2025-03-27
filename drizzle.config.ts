import { developmentDatabaseString } from '@/library/environment/publicVariables'
import type { Config } from 'drizzle-kit'

export default {
	dialect: 'postgresql',
	schema: './src/library/database/schema.ts',
	out: './drizzle',
	dbCredentials: {
		url: developmentDatabaseString,
	},
	verbose: true,
	strict: true,
} satisfies Config
