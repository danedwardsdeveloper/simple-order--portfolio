'use client'

import ConfirmEmailMessage from './components/ConfirmEmailMessage'
import EmptyInventoryMessage from './components/EmptyInventoryLink'
import InviteCustomerMessage from './components/InviteCustomerMessage'

import { useAuthorisation } from '@/providers/authorisation'

export default function DashboardPage() {
  const { clientSafeUser } = useAuthorisation()
  return (
    <>
      <div>
        <h1>Dashboard</h1>
        {clientSafeUser && <p>{`Welcome ${clientSafeUser.businessName}`}</p>}
        <ConfirmEmailMessage />
        <EmptyInventoryMessage />
        <InviteCustomerMessage />
      </div>
    </>
  )
}
