import { formatPrice } from '@/library/formatting/formatPrice'

export interface InventoryItemProps {
  displayName: string
  priceInPence: number
}

export default function InventoryItem({ displayName, priceInPence }: InventoryItemProps) {
  return (
    <div className="flex justify-between">
      <span>{displayName}</span>
      <span className="text-zinc-600">{formatPrice(priceInPence)}</span>
    </div>
  )
}
