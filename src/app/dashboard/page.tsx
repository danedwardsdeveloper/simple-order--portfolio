'use client'

import { useUi } from '@/providers/ui'

export default function DashboardPage() {
  const { user } = useUi()
  return (
    <>
      <div>
        <h1>Dashboard</h1>
        {user && <p>{`Welcome ${user.businessName}`}</p>}
      </div>
    </>
  )
}
