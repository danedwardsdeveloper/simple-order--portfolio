'use client'
import { SignedOutBreadCrumbs } from '@/components/BreadCrumbs'
import UnderConstruction from '@/components/UnderConstruction'
import { useUi } from '@/components/providers/ui'
import { useEffect } from 'react'

export default function DemoDashboard() {
	const { demoMode, setDemoMode } = useUi()

	// biome-ignore lint/correctness/useExhaustiveDependencies:
	useEffect(() => {
		if (!demoMode) setDemoMode(true)
	}, [])
	return (
		<>
			<SignedOutBreadCrumbs trail={[{ displayName: 'Demo', href: '/demo' }]} currentPageTitle="Dashboard" />
			<div className="">
				<h1>Dashboard</h1>
				<UnderConstruction />
			</div>
		</>
	)
}
