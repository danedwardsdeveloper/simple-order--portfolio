'use client'

import { useAuthorisation } from '@/providers/authorisation'
import InventoryCard from './InventoryCard'

export default function InventoryList() {
	const { clientSafeUser } = useAuthorisation()

	if (!clientSafeUser?.inventory) return null

	return (
		<ul className="flex flex-col w-full gap-y-4 max-w-xl -mx-3">
			{clientSafeUser.inventory.map((product, index) => (
				<InventoryCard key={product.id} product={product} zebraStripe={Boolean(index % 2)} />
			))}
		</ul>
	)
}
