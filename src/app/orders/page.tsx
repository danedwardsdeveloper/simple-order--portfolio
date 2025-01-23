'use client'

import { useUi } from '@/providers/ui'

export default function CustomersOnlyPage() {
  const { user, merchantMode } = useUi()
  const displayName = user?.businessNameAsCustomer ? user?.businessNameAsCustomer : user?.firstName

  function DualModeMessage() {
    if (user?.role !== 'both') return null
    if (merchantMode) {
      return <p>{`Orders received as a merchant`}</p>
    } else {
      return <p>{`Orders created as a customer`}</p>
    }
  }

  return (
    <>
      <h1>Orders</h1>
      <div className="flex flex-col gap-y-4">
        <DualModeMessage />
        <p>{`Welcome ${displayName}`}</p>
      </div>
    </>
  )
}
