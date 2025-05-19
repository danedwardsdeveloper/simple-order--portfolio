import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
	title: 'Dashboard DEMO', // + template
	alternates: {
		canonical: '/demo/dashboard',
	},
}

export default function Layout({ children }: { children: ReactNode }) {
	return children
}
