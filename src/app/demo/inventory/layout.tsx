import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
	title: 'Inventory [DEMO]', // + template
	alternates: {
		canonical: '/demo/inventory',
	},
}

export default function Layout({ children }: { children: ReactNode }) {
	return children
}
