import type { UserContextType } from '@/types'
import InventoryCard, { type InventoryCardProps } from './inventoryCard'

type Props = {
	inventory: UserContextType['inventory']
} & Pick<InventoryCardProps, 'handleDelete' | 'handleUpdate' | 'isDeleting'>

export default function InventoryList({ inventory, handleDelete, handleUpdate, isDeleting }: Props) {
	if (!inventory) return null // ToDo: add "No products yet" message

	return (
		<ul className="flex flex-col w-full gap-y-4 max-w-xl lg:-mx-3">
			{inventory.map((product, index) => (
				<InventoryCard
					key={product.id}
					product={product}
					zebraStripe={Boolean(index % 2)}
					handleDelete={handleDelete}
					handleUpdate={handleUpdate}
					isDeleting={isDeleting}
				/>
			))}
		</ul>
	)
}
