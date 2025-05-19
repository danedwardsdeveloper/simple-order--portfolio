import type { UserContextType } from '@/types'
import InventoryCard, { type InventoryCardProps } from './InventoryCard'

type Props = {
	inventory: UserContextType['inventory']
} & Pick<InventoryCardProps, 'updateProduct' | 'isUpdating' | 'deleteProduct' | 'isDeleting'>

export default function InventoryList({ inventory, updateProduct, isUpdating, deleteProduct, isDeleting }: Props) {
	if (!inventory || inventory.length === 0) {
		return <div>Your inventory is empty</div>
	}

	return (
		<ul className="flex flex-col w-full gap-y-4 max-w-xl lg:-mx-3">
			{inventory.map((product, index) => (
				<InventoryCard //
					key={product.id}
					product={product}
					zebraStripe={Boolean(index % 2)}
					updateProduct={updateProduct}
					isUpdating={isUpdating}
					deleteProduct={deleteProduct}
					isDeleting={isDeleting}
				/>
			))}
		</ul>
	)
}
