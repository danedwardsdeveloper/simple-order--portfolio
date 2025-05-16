'use client'
import { SignedOutBreadCrumbs } from '@/components/BreadCrumbs'
import MessageContainer from '@/components/MessageContainer'
import { useUi } from '@/components/providers/ui'
import { useEffect } from 'react'

export default function DemoDashboard() {
	const { demoMode, setDemoMode, merchantMode } = useUi()

	// biome-ignore lint/correctness/useExhaustiveDependencies:
	useEffect(() => {
		if (!demoMode) setDemoMode(true)
	}, [])

	return (
		<>
			<SignedOutBreadCrumbs currentPageTitle="Dashboard" />
			<h1>Dashboard</h1>
			<MessageContainer borderColour={'border-blue-300'}>
				Welcome to the Simple Order demo!
				<br />
				{`This is the dashboard for ${merchantMode ? 'merchants' : 'customers'}.`}
			</MessageContainer>
		</>
	)
}
