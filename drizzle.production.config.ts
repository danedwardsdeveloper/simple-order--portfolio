import { productionDatabaseString } from '@/library/environment/serverVariables'
import type { Config } from 'drizzle-kit'

export default {
	dialect: 'postgresql',
	schema: './src/library/database/schema.ts',
	out: './drizzle',
	dbCredentials: { url: productionDatabaseString },
	verbose: true,
	strict: true,
} satisfies Config
