import path from 'node:path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
// import '@testing-library/jest-dom'

export default defineConfig({
	plugins: [tsconfigPaths(), react()],
	test: {
		environment: 'jsdom',
		include: ['**/test.ts', '**/*.test.ts', '**/test.tsx', '**/*.test.tsx'],
		exclude: ['**/node_modules/**'],
		slowTestThreshold: 5000,
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@tests': path.resolve(__dirname, './tests'),
		},
	},
})
