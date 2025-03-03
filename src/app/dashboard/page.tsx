'use client'
import PleaseConfirmYourEmailMessage from '@/components/PleaseConfirmYourEmailMessage'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { apiPaths } from '@/library/constants'
import logger from '@/library/logger'
import { useUser } from '@/providers/user'
import { useEffect } from 'react'
import type { InventoryAdminGETresponse } from '../api/inventory/admin/route'
import EmptyInventoryMessage from './components/EmptyInventoryMessage'
import NoCustomersMessage from './components/NoCustomersMessage'

export default function DashboardPage() {
	const { user, inventory, setInventory, hasAttemptedInventoryFetch, setHasAttemptedInventoryFetch, confirmedCustomers } = useUser()

	// biome-ignore lint/correctness/useExhaustiveDependencies:
	useEffect(() => {
		if (!user) return

		async function getInventory() {
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
			}
		}

		getInventory()
	}, [user])

	if (!user) return <UnauthorisedLinks />

	return (
		<>
			<h2>Welcome {user.businessName}</h2>
			{!user.emailConfirmed && <PleaseConfirmYourEmailMessage email={user.email} />}
			{user.roles !== 'customer' && !inventory && <EmptyInventoryMessage />}
			{user.roles !== 'customer' && !confirmedCustomers && <NoCustomersMessage emailConfirmed={user.emailConfirmed} />}
		</>
	)
}
