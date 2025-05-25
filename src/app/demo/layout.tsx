import PageContainer from '@/components/PageContainer'
import { DemoSettingsProvider } from '@/components/providers/demo/settings'
import type { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<DemoSettingsProvider>
			<PageContainer>{children}</PageContainer>
		</DemoSettingsProvider>
	)
}
