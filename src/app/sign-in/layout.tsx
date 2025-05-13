import PageContainer from '@/components/PageContainer'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
	title: 'Sign in',
	description:
		'Sign in to Simple Order - a website for wholesalers and their customers so you can reduce costs, save time, and eliminate phone call confusion.',
	alternates: {
		canonical: '/sign-in',
	},
}

export default function Layout({ children }: { children: ReactNode }) {
	return <PageContainer>{children}</PageContainer>
}
