'use client'
import Spinner from '@/components/Spinner'
import TwoColumnContainer from '@/components/TwoColumnContainer'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { useUser } from '@/providers/user'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AddInventoryForm from './components/AddInventoryForm'
import InventoryControlPanel from './components/InventoryControlPanel'
import InventoryList from './components/InventoryList'

export default function InventoryPage() {
	const { user, isLoading } = useUser()
	const router = useRouter()

	useEffect(() => {
		if (user && user.roles === 'customer') {
			router.replace('/dashboard')
		}
	}, [user, router])

	if (!user) return <UnauthorisedLinks />

	if (isLoading) return <Spinner />

	// Only render the inventory UI if user is not a customer to prevent InventoryList from making bad requests
	if (user.roles === 'customer') {
		// Enhancement ToDo: Use this page to encourage customer-only users to start a free trial as a merchant
		return null
	}

	return (
		<>
			<h1>Inventory</h1>
			<TwoColumnContainer
				mainColumn={<InventoryList />}
				sideColumn={
					<>
						<InventoryControlPanel />
						<AddInventoryForm />
					</>
				}
				sideColumnClasses="gap-y-4"
			/>
		</>
	)
}
