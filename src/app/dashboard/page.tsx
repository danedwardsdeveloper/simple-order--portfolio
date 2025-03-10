'use client'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import Spinner from '@/components/Spinner'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { apiPaths } from '@/library/constants'
import logger from '@/library/logger'
import { useUser } from '@/providers/user'
import { useEffect, useState } from 'react'
import type { InventoryAdminGETresponse } from '../api/inventory/admin/route'
import WelcomeMessages from './components/WelcomeMessages'

export default function DashboardPage() {
	const { user, setInventory, hasAttemptedInventoryFetch, setHasAttemptedInventoryFetch } = useUser()
	const [isLoading, setIsLoading] = useState(false)

	// biome-ignore lint/correctness/useExhaustiveDependencies:
	useEffect(() => {
		if (!user) return

		async function getInventory() {
			setIsLoading(true)
			try {
				if (!user) return

				if (!hasAttemptedInventoryFetch) {
					const { inventory }: InventoryAdminGETresponse = await (
						await fetch(apiPaths.inventory.merchantPerspective.base, { credentials: 'include' })
					).json()
					if (inventory) setInventory(inventory)
					setHasAttemptedInventoryFetch(true)
				}
			} catch (error) {
				logger.error('Error getting inventory from dashboard/page.tsx:', error)
			} finally {
				setIsLoading(false)
			}
		}

		getInventory()
	}, [])

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
