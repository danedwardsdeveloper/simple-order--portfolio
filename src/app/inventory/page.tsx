'use client'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { useUser } from '@/providers/user'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AddInventoryForm from './components/AddInventoryForm'
import InventoryControlPanel from './components/InventoryControlPanel'
import InventoryList from './components/InventoryList'

export default function InventoryPage() {
	const { user } = useUser()
	const router = useRouter()

	useEffect(() => {
		if (user && user.roles === 'customer') {
			router.replace('/dashboard')
		}
	}, [user, router])

	if (!user) return <UnauthorisedLinks />

	// Only render the inventory UI if user is not a customer to prevent InventoryList from making bad requests
	if (user.roles === 'customer') {
		// Enhancement ToDo: Use this page to encourage customer-only users to start a free trial as a merchant
		return null
	}

	return (
		<>
			<h1 className="">Inventory</h1>
			<div className="mx-auto w-full max-w-7xl grow flex flex-col lg:flex-row xl:px-2 gap-8">
				<div className="flex-1 xl:flex order-last lg:order-first">
					<InventoryList />
				</div>

				<div className="shrink-0 lg:w-96 order-first lg:order-last">
					<div className="flex flex-col gap-y-4 ">
						<InventoryControlPanel />
						<AddInventoryForm />
					</div>
				</div>
			</div>
		</>
	)
}
