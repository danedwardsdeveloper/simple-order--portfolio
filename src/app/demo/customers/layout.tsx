import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
	title: 'Customers [DEMO]', // + template
	alternates: {
		canonical: '/demo/customers',
	},
}

export default function Layout({ children }: { children: ReactNode }) {
	return children
}
