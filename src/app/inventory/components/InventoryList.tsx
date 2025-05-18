import type { UserContextType } from '@/types'
import InventoryCard, { type HandleDeleteProduct } from './InventoryCard'

// Prop drilling here but InventoryCard is already very complicated
type Props = {
	inventory: UserContextType['inventory']
	handleDelete: HandleDeleteProduct
	isDeleting: boolean
}

export default function InventoryList({ inventory, handleDelete, isDeleting }: Props) {
	if (!inventory) return null // ToDo: add "No products yet" message

	return (
		<ul className="flex flex-col w-full gap-y-4 max-w-xl lg:-mx-3">
			{inventory.map((product, index) => (
				<InventoryCard
					key={product.id}
					product={product}
					zebraStripe={Boolean(index % 2)}
					handleDelete={handleDelete}
					isDeleting={isDeleting}
				/>
			))}
		</ul>
	)
}
