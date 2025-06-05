import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	output: 'standalone',
	productionBrowserSourceMaps: true,
	devIndicators: false,
	async headers() {
		return [
			{
				source: '/logo.svg', // BIMI logo
				headers: [
					{
						key: 'Content-Type',
						value: 'image/svg+xml',
					},
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000',
					},
				],
			},
		]
	},
}

export default nextConfig
