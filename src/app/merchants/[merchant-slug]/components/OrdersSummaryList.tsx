import { orders } from '@/library/temporaryData/temporaryOrders'

import OrderSummary from './OrderItem'

export default function OrderSummaryList() {
  return (
    <ul className="flex flex-col gap-y-4">
      {orders.map((order, index) => (
        <li key={index}>
          <OrderSummary orderSummary={order} />
        </li>
      ))}
    </ul>
  )
}
