import { AuthorisationProvider } from '@/providers/authorisation'
import { NotificationsProvider } from '@/providers/notifications'
import { UiProvider } from '@/providers/ui'

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<UiProvider>
			<NotificationsProvider>
				<AuthorisationProvider>{children}</AuthorisationProvider>
			</NotificationsProvider>
		</UiProvider>
	)
}
