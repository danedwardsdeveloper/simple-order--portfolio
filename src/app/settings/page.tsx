'use client'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import RoleModeButton from '@/components/menubar/RoleModeButton'
import { useUser } from '@/providers/user'
import SignOutButton from './components/SignOutButton'
import UserInformation from './components/UserInformation'

export default function SettingsPage() {
	const { user } = useUser()

	if (!user) return <UnauthorisedLinks />

	return (
		<>
			<RoleModeButton />
			<UserInformation />
			<SignOutButton />
		</>
	)
}
