import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		include: ['**/test.ts'],
		exclude: ['**/node_modules/**'],
		env: {
			NODE_ENV: 'development',
		},
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
})
