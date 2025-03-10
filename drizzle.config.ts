import type { Config } from 'drizzle-kit'

export default {
	dialect: 'postgresql',
	schema: './src/library/database/schema.ts',
	out: './drizzle',
	dbCredentials: {
		// url: process.env.PRODUCTION_DATABASE_STRING!,
		// biome-ignore lint/style/noNonNullAssertion: <this file is only for migrations>
		url: process.env.DEVELOPMENT_DATABASE_STRING!,
	},
	verbose: true,
	strict: true,
} satisfies Config
