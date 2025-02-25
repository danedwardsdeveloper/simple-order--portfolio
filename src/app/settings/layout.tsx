import PageContainer from '@/components/PageContainer'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
	title: 'Settings',
}

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<PageContainer>
			<div className="flex flex-col gap-y-4 items-start">
				<h1>Settings</h1>
				{children}
			</div>
		</PageContainer>
	)
}
