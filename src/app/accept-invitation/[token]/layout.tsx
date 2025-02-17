import PageContainer from '@/components/PageContainer'
import type { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
	return <PageContainer>{children}</PageContainer>
}
