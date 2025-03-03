'use client'
import Spinner from '@/components/Spinner'
import { useUser } from '@/providers/user'
import { useState } from 'react'
import ConfirmedCustomerCard from './ConfirmedCustomerCard'
import InvitedCustomerCard from './InvitedCustomerCard'

export default function CustomersList() {
	const { confirmedCustomers, invitedCustomers } = useUser()
	const [isLoading] = useState(false)
	const [message] = useState('')

	// Enhancement ToDo: implement React Query for better data caching
	// ToDo: Get invited customers

	// useEffect(() => {
	// 	async function getCustomers() {
	// 		try {
	// 			setIsLoading(true)
	// 			const { confirmedCustomers, invitedCustomers, message }: CustomersGETresponse = await (
	// 				await fetch(apiPaths.customers.base, { credentials: 'include' })
	// 			).json()

	// 			if (confirmedCustomers) setConfirmedCustomers(confirmedCustomers)
	// 			if (invitedCustomers) setInvitedCustomers(invitedCustomers)

	// 			if (!confirmedCustomers && !invitedCustomers) {
	// 				setMessage(message || 'No customers found')
	// 			} else {
	// 				setMessage('')
	// 			}
	// 		} catch (error) {
	// 			logger.error('Error fetching customers:', error)
	// 			setMessage('Failed to load customers. Please try again later.')
	// 		} finally {
	// 			setIsLoading(false)
	// 			setHasAttemptedCustomersFetch(true)
	// 		}
	// 	}

	// 	if (!hasAttemptedCustomersFetch) {
	// 		getCustomers()
	// 	}
	// }, [])

	// Enhancement ToDo: create skeleton
	if (isLoading) return <Spinner />

	return (
		<div className="flex flex-col gap-y-4">
			{confirmedCustomers && (
				<h2 className="mt-12">
					{confirmedCustomers.length} Confirmed customer{confirmedCustomers.length !== 1 && 's'}
				</h2>
			)}
			{confirmedCustomers?.map((customer, index) => (
				<ConfirmedCustomerCard key={customer.businessName} confirmedCustomer={customer} zebraStripe={Boolean(index % 2)} />
			))}
			{invitedCustomers && (
				<h2 className="mt-12">
					{invitedCustomers.length} Invited customer{invitedCustomers.length !== 1 && 's'}
				</h2>
			)}
			{invitedCustomers?.map((customer, index) => (
				<InvitedCustomerCard key={customer.obfuscatedEmail} invitedCustomer={customer} zebraStripe={Boolean(index % 2)} />
			))}

			{message && <div>{message}</div>}
		</div>
	)
}
