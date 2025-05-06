'use client'
import { LoadingProvider } from '@/components/providers/loading'
import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'

const UiProvider = dynamic(() => import('@/components/providers/ui').then((module) => module.UiProvider), {
	ssr: false,
})

const NotificationsProvider = dynamic(() => import('@/components/providers/notifications').then((module) => module.NotificationsProvider), {
	ssr: false,
})

const UserProvider = dynamic(() => import('@/components/providers/user').then((module) => module.UserProvider), {
	ssr: false,
})

const NotificationsContainer = dynamic(() => import('@/components/notifications/NotificationsContainer').then((module) => module.default), {
	ssr: false,
})

export default function Providers({ children }: { children: ReactNode }) {
	return (
		<UiProvider>
			<NotificationsProvider>
				<UserProvider>
					<NotificationsContainer />
					<LoadingProvider>{children}</LoadingProvider>
				</UserProvider>
			</NotificationsProvider>
		</UiProvider>
	)
}
