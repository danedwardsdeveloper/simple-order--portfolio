import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
	title: 'Orders DEMO', // + template
	alternates: {
		canonical: '/demo/orders',
	},
}

export default function Layout({ children }: { children: ReactNode }) {
	return children
}
