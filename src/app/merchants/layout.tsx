import PageContainer from '@/components/PageContainer'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
	title: 'Merchants',
}

// Don't put the title here as it applies to /merchants/[merchantSlug] too!
export default function Layout({ children }: { children: ReactNode }) {
	return <PageContainer>{children}</PageContainer>
}
