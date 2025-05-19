'use client'
import { LoadingProvider } from '@/components/providers/loading'
import { isDevelopment } from '@/library/environment/publicVariables'
import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'
import { DemoUserProvider } from './demo/user'
import { DevelopmentProvider } from './development'
import { InventoryProvider } from './inventory'
import { MerchantSettingsProvider } from './settings'

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
	function ProductionProviders({ children }: { children: ReactNode }) {
		return (
			<UiProvider>
				<NotificationsProvider>
					<UserProvider>
						<DemoUserProvider>
							<InventoryProvider>
								<MerchantSettingsProvider>
									<NotificationsContainer />
									<LoadingProvider>{children}</LoadingProvider>
								</MerchantSettingsProvider>
							</InventoryProvider>
						</DemoUserProvider>
					</UserProvider>
				</NotificationsProvider>
			</UiProvider>
		)
	}

	if (isDevelopment)
		return (
			<DevelopmentProvider>
				<ProductionProviders>{children}</ProductionProviders>
			</DevelopmentProvider>
		)

	return <ProductionProviders>{children}</ProductionProviders>
}
