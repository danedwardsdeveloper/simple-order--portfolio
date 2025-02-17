import { AuthorisationProvider } from '@/providers/authorisation'
import { NotificationsProvider } from '@/providers/notifications'
import { UiProvider } from '@/providers/ui'
import type { ReactNode } from 'react'

export default function Providers({ children }: { children: ReactNode }) {
	return (
		<UiProvider>
			<NotificationsProvider>
				<AuthorisationProvider>{children}</AuthorisationProvider>
			</NotificationsProvider>
		</UiProvider>
	)
}
