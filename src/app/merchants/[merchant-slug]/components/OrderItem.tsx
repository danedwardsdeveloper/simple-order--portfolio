import { formatPrice } from '@/library/formatting/formatPrice'

import { OrderItem } from '@/types'

export interface OrderSummaryInterface {
  customerName: string
  dueDate: string
  items: OrderItem[]
}

export default function OrderSummary({ orderSummary }: { orderSummary: OrderSummaryInterface }) {
  const { customerName, items } = orderSummary
  const totalPrice = items.reduce((total, item) => {
    return total + item.itemDetails.priceInPence * item.quantity
  }, 0)

  return (
    <div className="w-full bg-slate-50 border border-slate-100 rounded-lg max-w-md p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-medium">{customerName}</h2>
        <span className="text-lg text-slate-500">{formatPrice(totalPrice)}</span>
      </div>
      <ul className="flex flex-col gap-y-4">
        {items.map((item, index) => (
          <li key={index} className="flex justify-between">
            <span>{item.itemDetails.displayName}</span>
            <span className="text-zinc-600">{item.quantity}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
