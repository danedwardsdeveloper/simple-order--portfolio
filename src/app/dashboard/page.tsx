'use client'
import PleaseConfirmYourEmailMessage from '@/components/PleaseConfirmYourEmailMessage'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { apiPaths } from '@/library/constants'
import logger from '@/library/logger'
import { useUser } from '@/providers/user'
import { useEffect } from 'react'
import type { CustomersGETresponse } from '../api/customers/route'
import type { InventoryAdminGETresponse } from '../api/inventory/admin/route'
import EmptyInventoryMessage from './components/EmptyInventoryMessage'
import NoCustomersMessage from './components/NoCustomersMessage'

export default function DashboardPage() {
	const {
		user,
		inventory,
		setInventory,
		hasAttemptedInventoryFetch,
		setHasAttemptedInventoryFetch,
		setInvitedCustomers,
		setConfirmedCustomers,
		hasAttemptedCustomersFetch,
		setHasAttemptedCustomersFetch,
		showNoCustomersMessage,
	} = useUser()

	useEffect(() => {
		if (!user) return

		async function fetchData() {
			try {
				if (!user) return

				const fetchPromises = []
				const fetchTypes: ('inventory' | 'customers')[] = []

				if (!hasAttemptedInventoryFetch) {
					fetchPromises.push(fetch(apiPaths.inventory.admin.base, { credentials: 'include' }).then((res) => res.json()))
					fetchTypes.push('inventory')
				}

				if (user.roles !== 'customer' && !hasAttemptedCustomersFetch) {
					fetchPromises.push(fetch(apiPaths.customers.base, { credentials: 'include' }).then((res) => res.json()))
					fetchTypes.push('customers')
				}

				if (fetchPromises.length === 0) return

				const responses = await Promise.all(fetchPromises)

				responses.forEach((result, index) => {
					const fetchType = fetchTypes[index]

					if (fetchType === 'inventory') {
						const { inventory }: InventoryAdminGETresponse = result
						if (inventory) setInventory(inventory)
						setHasAttemptedInventoryFetch(true)
					} else if (fetchType === 'customers') {
						const { invitedCustomers, confirmedCustomers }: CustomersGETresponse = result

						if (invitedCustomers) setInvitedCustomers(invitedCustomers)
						if (confirmedCustomers) setConfirmedCustomers(confirmedCustomers)
						setHasAttemptedCustomersFetch(true)
					}
				})
			} catch (error) {
				logger.error('Error fetching dashboard data:', error)
			}
		}

		fetchData()
	}, [
		user,
		hasAttemptedInventoryFetch,
		hasAttemptedCustomersFetch,
		setInventory,
		setInvitedCustomers,
		setConfirmedCustomers,
		setHasAttemptedInventoryFetch,
		setHasAttemptedCustomersFetch,
	])

	if (!user) return <UnauthorisedLinks />

	return (
		<>
			<h2>Welcome {user.businessName}</h2>
			{!user.emailConfirmed && <PleaseConfirmYourEmailMessage email={user.email} />}
			{!inventory && <EmptyInventoryMessage />}
			{showNoCustomersMessage && <NoCustomersMessage emailConfirmed={user.emailConfirmed} />}
		</>
	)
}
