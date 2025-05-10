'use client'
import Spinner from '@/components/Spinner'
import TwoColumnContainer from '@/components/TwoColumnContainer'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { useUser } from '@/components/providers/user'
import { serviceConstraints } from '@/library/constants'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AddInventoryForm from './components/AddInventoryForm'
import InventoryList from './components/InventoryList'
import VatToggleButton from './components/VatToggleButton'

export default function InventoryPage() {
	const { user, inventory, isLoading } = useUser()
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

	function InventorySizeMessage() {
		return (
			<div className="max-w-xl flex border-2 border-blue-200 p-3 lg:-mx-3 rounded-xl">
				<p>
					{(() => {
						if (!inventory || inventory.length === 0) {
							return <>Inventory empty. You can add up to {serviceConstraints.maximumProducts} products</>
						}
						return (
							<>
								You have {inventory?.length || 0} product{inventory?.length !== 1 && 's'} - maximum {serviceConstraints.maximumProducts}
							</>
						)
					})()}
				</p>
			</div>
		)
	}

	return (
		<>
			<h1>Inventory</h1>
			<TwoColumnContainer
				mainColumn={<InventoryList />}
				sideColumn={
					<>
						<InventorySizeMessage />
						<VatToggleButton />
						<AddInventoryForm />
					</>
				}
				sideColumnClasses="gap-y-4"
			/>
		</>
	)
}
