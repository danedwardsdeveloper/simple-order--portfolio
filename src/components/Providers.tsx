import { NotificationsProvider } from '@/providers/notifications'
import { UiProvider } from '@/providers/ui'
import { UserProvider } from '@/providers/user'
import type { ReactNode } from 'react'

export default function Providers({ children }: { children: ReactNode }) {
	return (
		<UiProvider>
			<NotificationsProvider>
				<UserProvider>{children}</UserProvider>
			</NotificationsProvider>
		</UiProvider>
	)
}
