import PageContainer from '@/components/PageContainer'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
	title: 'Demo', // ...template
	alternates: {
		canonical: '/demo',
	},
}

export default function Layout({ children }: { children: ReactNode }) {
	return <PageContainer>{children}</PageContainer>
}
