'use client'

import { useUi } from '@/providers/ui'

export default function CustomersOnlyPage() {
  const { user } = useUi()
  const displayName = user?.businessNameAsCustomer ? user?.businessNameAsCustomer : user?.firstName
  return (
    <>
      <h1>Customers only page</h1>
      <p>{`Welcome ${displayName}`}</p>
    </>
  )
}
