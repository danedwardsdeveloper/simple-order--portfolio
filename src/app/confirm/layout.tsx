import PageContainer from '@/components/PageContainer'
import type { ReactNode } from 'react'

// ToDo: add metadata

export default function ConfirmPageLayout({ children }: { children: ReactNode }) {
	return <PageContainer>{children}</PageContainer>
}
