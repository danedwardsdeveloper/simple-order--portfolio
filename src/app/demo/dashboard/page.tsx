'use client'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import MessageContainer from '@/components/MessageContainer'
import { useDemoUser } from '@/components/providers/demo/user'
import { useUi } from '@/components/providers/ui'

export default function DemoDashboard() {
	const { merchantMode } = useUi()
	const { demoUser } = useDemoUser()

	// Somehow ensure merchantMode is true without annoying people exploring the trial...

	return (
		<>
			<SignedInBreadCrumbs businessName={demoUser.businessName} currentPageTitle="Dashboard" isDemo={true} />
			<h1>Dashboard</h1>
			<MessageContainer borderColour={'border-blue-300'}>
				Welcome to the Simple Order demo!
				<br />
				{`This is the dashboard for ${merchantMode ? 'merchants' : 'customers'}.`}
			</MessageContainer>
		</>
	)
}
