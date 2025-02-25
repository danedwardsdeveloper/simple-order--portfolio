import type { Config } from 'drizzle-kit'

// This file is only for migrations

export default {
	dialect: 'postgresql',
	schema: './src/library/database/schema.ts',
	out: './drizzle',
	dbCredentials: {
		url: 'postgresql://localhost/simple_order_dev',
	},
	verbose: true,
	strict: true,
} satisfies Config
