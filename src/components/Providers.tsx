'use client'
import { LoadingProvider } from '@/providers/loading'
import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'

const UiProvider = dynamic(() => import('@/providers/ui').then((module) => module.UiProvider), {
	ssr: false,
})

const NotificationsProvider = dynamic(() => import('@/providers/notifications').then((module) => module.NotificationsProvider), {
	ssr: false,
})

const UserProvider = dynamic(() => import('@/providers/user').then((module) => module.UserProvider), {
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
