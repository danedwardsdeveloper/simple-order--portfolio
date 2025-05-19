import { DemoSettingsProvider } from '@/components/providers/demo/settings'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
	title: 'Settings DEMO', // + template
	alternates: {
		canonical: '/demo/settings',
	},
}

export default function Layout({ children }: { children: ReactNode }) {
	return <DemoSettingsProvider>{children}</DemoSettingsProvider>
}
