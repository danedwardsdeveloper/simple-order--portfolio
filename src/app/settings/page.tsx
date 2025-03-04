'use client'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
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
			<SignedInBreadCrumbs businessName={user.businessName} currentPageTitle="Settings" />
			<div className="flex flex-col gap-y-4 items-start">
				<h1>Settings</h1>

				<RoleModeButton />
				<UserInformation />
				<SignOutButton />
			</div>
		</>
	)
}
