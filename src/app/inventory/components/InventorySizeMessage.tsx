import { serviceConstraints } from '@/library/constants'
import type { UserContextType } from '@/types'

export default function InventorySizeMessage({ inventory }: { inventory: UserContextType['inventory'] }) {
	return (
		<div className="max-w-xl flex border-2 border-blue-200 p-3 lg:-mx-3 rounded-xl">
			<p>
				{(() => {
					if (!inventory || inventory.length === 0) {
						return <>Inventory empty. You can add up to {serviceConstraints.maximumProducts} products</>
					}
					return (
						<>
							{inventory?.length || 0} / {serviceConstraints.maximumProducts} products
						</>
					)
				})()}
			</p>
		</div>
	)
}
