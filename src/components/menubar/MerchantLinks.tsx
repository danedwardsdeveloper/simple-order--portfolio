'use client'

import { findUserById } from '@/library/tempData/users'

import MenuItem from './MenuItem'
import { useUi } from '@/providers/ui'

export default function MerchantLinks() {
  const { user } = useUi()
  const isCustomer = user?.role === 'customer' || user?.role === 'both'

  if (!user || !isCustomer || !user.merchantIds) return null

  if (user.merchantIds.length !== 1) {
    return <MenuItem href="/merchants" text="Merchants" />
  }

  return (
    <>
      {user.merchantIds.map(merchantId => {
        const merchantDetails = findUserById(merchantId)
        return (
          <MenuItem
            key={merchantId}
            href={`/merchant/${merchantDetails?.id}`}
            text={merchantDetails?.merchantProfile?.businessName || ''}
          />
        )
      })}
    </>
  )
}
