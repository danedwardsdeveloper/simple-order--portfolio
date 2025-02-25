'use client'
import type { CustomersGETresponse } from '@/app/api/customers/route'
import Spinner from '@/components/Spinner'
import { apiPaths } from '@/library/constants'
import logger from '@/library/logger'
import { useUser } from '@/providers/user'
import { useEffect, useState } from 'react'
import ConfirmedCustomerCard from './ConfirmedCustomerCard'
import InvitedCustomerCard from './InvitedCustomerCard'

export default function CustomersList() {
	const { confirmedCustomers, setConfirmedCustomers, invitedCustomers, setInvitedCustomers } = useUser()
	const [isLoading, setIsLoading] = useState(true)
	const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false)
	const [message, setMessage] = useState('')

	useEffect(() => {
		async function getCustomers() {
			try {
				setIsLoading(true)
				const { confirmedCustomers, invitedCustomers, message }: CustomersGETresponse = await (
					await fetch(apiPaths.customers.base, { credentials: 'include' })
				).json()

				setConfirmedCustomers(confirmedCustomers)
				setInvitedCustomers(invitedCustomers)

				if (!confirmedCustomers && !invitedCustomers) {
					setMessage(message || 'No customers found')
				} else {
					setMessage('')
				}
			} catch (error) {
				logger.error('Error fetching customers:', error)
				setMessage('Failed to load customers. Please try again later.')
			} finally {
				setIsLoading(false)
				setHasAttemptedFetch(true)
			}
		}

		if (!hasAttemptedFetch) {
			getCustomers()
		}
	}, [setConfirmedCustomers, setInvitedCustomers, hasAttemptedFetch])

	if (isLoading) return <Spinner />

	return (
		<div className="flex flex-col gap-y-4">
			{confirmedCustomers && <h2 className="mt-12">Customers</h2>}
			{confirmedCustomers?.map((customer, index) => (
				<ConfirmedCustomerCard key={customer.businessName} confirmedCustomer={customer} zebraStripe={Boolean(index % 2)} />
			))}
			{invitedCustomers && <h2 className="mt-12">Invited customers</h2>}
			{invitedCustomers?.map((customer, index) => (
				<InvitedCustomerCard key={customer.obfuscatedEmail} invitedCustomer={customer} zebraStripe={Boolean(index % 2)} />
			))}

			{message && <div>{message}</div>}
		</div>
	)
}
