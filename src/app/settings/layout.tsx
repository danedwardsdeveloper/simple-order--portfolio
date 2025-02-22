import PageContainer from '@/components/PageContainer'
import type { ReactNode } from 'react'

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
