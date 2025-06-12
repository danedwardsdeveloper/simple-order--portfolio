import PageContainer from '@/components/PageContainer'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
	title: 'Confirm your email',
}

export default function ConfirmPageLayout({ children }: { children: ReactNode }) {
	return <PageContainer>{children}</PageContainer>
}
