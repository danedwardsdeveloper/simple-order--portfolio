import PageContainer from '@/components/PageContainer'
import { siteIsLaunched } from '@/library/environment/publicVariables'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
	if (siteIsLaunched) return notFound()

	return (
		<PageContainer>
			<div className="max-w-lg">{children}</div>
		</PageContainer>
	)
}
