'use client'

import MenuItem from './MenuItem'
import { useUi } from '@/providers/ui'

export default function MerchantLinks() {
  const { user } = useUi()

  if (!user) return null

  return <MenuItem href="/merchants" text="Merchants" />
}
