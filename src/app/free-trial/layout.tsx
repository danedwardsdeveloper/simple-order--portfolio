import PageContainer from '@/components/PageContainer'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
	title: 'Start a free trial',
	description:
		'Start a free trial on Simple Order - a website for wholesalers and their customers so you can reduce costs, save time, and eliminate phone call confusion.',
	alternates: {
		canonical: '/free-trial',
	},
}

export default function FreeTrialLayout({ children }: { children: ReactNode }) {
	return <PageContainer>{children}</PageContainer>
}
