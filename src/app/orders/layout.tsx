import PageContainer from '@/components/PageContainer'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
	title: 'Orders',
}

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<PageContainer>
			{/* Don't put the title here because it's dynamic */}
			{children}
		</PageContainer>
	)
}
