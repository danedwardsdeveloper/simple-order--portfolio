'use client'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import RoleModeButton from '@/components/menubar/RoleModeButton'
import { useAuthorisation } from '@/providers/authorisation'
import SignOutButton from './components/SignOutButton'

export default function SettingsPage() {
	const { browserSafeUser } = useAuthorisation()

	if (!browserSafeUser) return <UnauthorisedLinks />

	return (
		<>
			<RoleModeButton />
			<SignOutButton />
		</>
	)
}
