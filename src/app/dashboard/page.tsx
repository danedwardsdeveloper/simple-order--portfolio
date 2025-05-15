'use client'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { useUser } from '@/components/providers/user'
import WelcomeMessages from './components/WelcomeMessages'

export default function DashboardPage() {
	const { user } = useUser()
	if (!user) return <UnauthorisedLinks />

	return (
		<>
			<SignedInBreadCrumbs businessName={user.businessName} />
			<h1>Dashboard</h1>
			<WelcomeMessages />
		</>
	)
}
