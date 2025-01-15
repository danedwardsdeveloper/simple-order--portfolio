import InventoryItem from './InventoryItem'
import { Item } from '@/types'

export default function InventoryList({ items }: { items: Item[] }) {
  return (
    <div className="max-w-md flex flex-col gap-y-2">
      {items.map((item, index) => (
        <InventoryItem key={index} displayName={item.displayName} priceInPence={item.priceInPence} />
      ))}
    </div>
  )
}
