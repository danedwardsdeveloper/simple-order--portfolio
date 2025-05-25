'use client'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import MessageContainer from '@/components/MessageContainer'
import { useDemoUser } from '@/components/providers/demo/user'

export default function DemoDashboard() {
	const { resolvedUser } = useDemoUser()

	// Somehow ensure merchantMode is true without annoying people exploring the trial...

	return (
		<>
			<SignedInBreadCrumbs businessName={resolvedUser.businessName} currentPageTitle="Dashboard" isDemo={true} />
			<h1>Dashboard</h1>
			<MessageContainer borderColour={'border-blue-300'}>Welcome to the Simple Order demo!</MessageContainer>
		</>
	)
}
