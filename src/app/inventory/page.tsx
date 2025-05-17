'use client'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import TwoColumnContainer from '@/components/TwoColumnContainer'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { useUser } from '@/components/providers/user'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AddInventoryForm from './components/AddInventoryForm'
import InventoryList from './components/InventoryList'
import InventorySizeMessage from './components/InventorySizeMessage'
import VatToggleButton from './components/VatToggleButton'

export default function InventoryPage() {
	const { user, inventory } = useUser()
	const router = useRouter()

	useEffect(() => {
		// Enhancement ToDo: Use this page to encourage customer-only users to start a free trial as a merchant

		if (user && user.roles === 'customer') {
			router.replace('/dashboard')
		}
	}, [user, router])

	if (!user) return <UnauthorisedLinks />

	return (
		<>
			<SignedInBreadCrumbs businessName={user.businessName} currentPageTitle="Inventory" />
			<h1>Inventory</h1>
			<TwoColumnContainer
				mainColumn={<InventoryList inventory={inventory} />}
				sideColumn={
					<>
						<InventorySizeMessage inventory={inventory} />
						<VatToggleButton />
						<AddInventoryForm />
					</>
				}
			/>
		</>
	)
}
