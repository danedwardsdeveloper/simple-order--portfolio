'use client'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import Spinner from '@/components/Spinner'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { useUser } from '@/providers/user'
import WelcomeMessages from './components/WelcomeMessages'

export default function DashboardPage() {
	const { user, isLoading } = useUser()

	if (!user) return <UnauthorisedLinks />

	if (isLoading) return <Spinner />

	return (
		<>
			<SignedInBreadCrumbs businessName={user.businessName} />
			<h1>Dashboard</h1>
			<WelcomeMessages />
		</>
	)
}
