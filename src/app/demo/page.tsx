'use client'
import { SignedOutBreadCrumbs } from '@/components/BreadCrumbs'
import { useUi } from '@/components/providers/ui'
import { isProduction } from '@/library/environment/publicVariables'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useEffect } from 'react'

export default function Page() {
	const { demoMode, setDemoMode } = useUi()

	// biome-ignore lint/correctness/useExhaustiveDependencies:
	useEffect(() => {
		if (!demoMode) setDemoMode(true)
	}, [])

	if (isProduction) return notFound()

	return (
		<>
			<SignedOutBreadCrumbs currentPageTitle="Demo" />
			<h1>Demo home page</h1>
			<Link href="/demo/settings" className="link-primary">
				Demo settings
			</Link>
		</>
	)
}
