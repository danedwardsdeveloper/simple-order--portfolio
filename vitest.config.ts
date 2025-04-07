import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		include: ['**/test.ts', '**/*.test.ts'],
		exclude: ['**/node_modules/**'],
		slowTestThreshold: 2000,
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@tests': path.resolve(__dirname, './tests'),
		},
	},
})
