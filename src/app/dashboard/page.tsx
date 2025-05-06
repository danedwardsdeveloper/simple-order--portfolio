'use client'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import ContentSplash from '@/components/ContentSplash'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { useUser } from '@/components/providers/user'
import WelcomeMessages from './components/WelcomeMessages'

export default function DashboardPage() {
	const { user, isLoading } = useUser()

	if (isLoading) return <ContentSplash />

	if (!isLoading && !user) return <UnauthorisedLinks />

	if (user) {
		return (
			<>
				<SignedInBreadCrumbs businessName={user.businessName} />
				<h1>Dashboard</h1>
				<WelcomeMessages />
			</>
		)
	}
}
