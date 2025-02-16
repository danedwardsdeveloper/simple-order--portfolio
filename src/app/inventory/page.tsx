import AddInventoryForm from './components/AddInventoryForm'
import InventoryControlPanel from './components/InventoryControlPanel'
import InventoryList from './components/InventoryList'

export default function InventoryPage() {
	return (
		<div className="flex flex-col gap-y-4">
			<h1>Inventory</h1>
			<InventoryControlPanel />
			<InventoryList />
			<AddInventoryForm />
		</div>
	)
}
