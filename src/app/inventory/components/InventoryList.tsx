'use client'

import { temporaryProducts } from '@/library/database/schema'

import InventoryCard from './InventoryCard'

export default function InventoryList() {
  return (
    <ul className="flex flex-col w-full gap-y-4 max-w-xl -mx-3">
      {temporaryProducts.map((product, index) => (
        <InventoryCard key={product.id} product={product} zebraStripe={Boolean(index % 2)} />
      ))}
    </ul>
  )
}
