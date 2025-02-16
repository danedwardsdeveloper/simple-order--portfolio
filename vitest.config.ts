import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		environment: 'node',
		include: ['tests/**/*.test.ts'],
		exclude: ['**/node_modules/**', '**/.next/**', '**/.drizzle/**', '**/.misc/**', '**/.public/**'],
		slowTestThreshold: 1000, // milliseconds
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
})
