'use client'

import Link from 'next/link'

import ConfirmEmailMessage from './components/ConfirmEmailMessage'
import EmptyInventoryMessage from './components/EmptyInventoryLink'

import { useAuthorisation } from '@/providers/authorisation'
import { useUi } from '@/providers/ui'

export default function DashboardPage() {
  const { clientSafeUser } = useAuthorisation()
  const { merchantMode } = useUi()

  if (!clientSafeUser) {
    return null
  }

  const emailConfirmed = clientSafeUser.emailConfirmed
  const hasCustomers =
    Array.isArray(clientSafeUser.merchantDetails?.customersAsMerchant) && clientSafeUser.merchantDetails?.customersAsMerchant.length > 0

  function NoCustomersMessage() {
    if (hasCustomers) return null
    if (emailConfirmed) {
      return (
        <div className="max-w-prose p-3 my-4 border-2 rounded-xl border-blue-300">
          <Link href="/customers" className="link">
            Invite your first customer
          </Link>
        </div>
      )
    } else {
      return (
        <p className="max-w-prose p-3 my-4 border-2 rounded-xl border-orange-300">{`You must confirm your email before inviting your first customer`}</p>
      )
    }
  }

  return (
    <>
      <div>
        <h1>Dashboard</h1>
        {clientSafeUser && <p>{`Welcome ${clientSafeUser.businessName}`}</p>}
        <ConfirmEmailMessage />
        <EmptyInventoryMessage />
        {merchantMode && <NoCustomersMessage />}
      </div>
    </>
  )
}
