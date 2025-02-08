'use client'

import InventoryCard from './InventoryCard'
import { useAuthorisation } from '@/providers/authorisation'

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
