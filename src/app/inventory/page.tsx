'use client'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { useAuthorisation } from '@/providers/authorisation'
import AddInventoryForm from './components/AddInventoryForm'
import InventoryControlPanel from './components/InventoryControlPanel'
import InventoryList from './components/InventoryList'

export default function InventoryPage() {
	const { browserSafeUser } = useAuthorisation()
	if (!browserSafeUser) return <UnauthorisedLinks />

	return (
		<div className="flex flex-col gap-y-4">
			<h1>Inventory</h1>
			<InventoryControlPanel />
			<InventoryList />
			<AddInventoryForm />
		</div>
	)
}
