'use client'
import { useUser } from '@/providers/user'
import InventoryCard from './InventoryCard'

export default function InventoryList() {
	const { inventory } = useUser()

	if (!inventory) return null

	return (
		<ul className="flex flex-col w-full gap-y-4 max-w-xl lg:-mx-3">
			{inventory?.map((product, index) => (
				<InventoryCard key={product.id} product={product} zebraStripe={Boolean(index % 2)} />
			))}
		</ul>
	)
}
