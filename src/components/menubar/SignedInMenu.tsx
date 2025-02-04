'use client'

import HomePageLink from './HomePageLink'
import MenuContainer from './MenuContainer'
import MenuItem from './MenuItem'
import MerchantLinks from './MerchantLinks'
import RoleModeButton from './RoleModeButton'
import { useAuthorisation } from '@/providers/authorisation'
import { useUi } from '@/providers/ui'

export default function SignedInMenu() {
  const { clientSafeUser } = useAuthorisation()
  const { merchantMode } = useUi()

  function DashboardLink() {
    return <MenuItem href="/dashboard" text={clientSafeUser?.businessName || 'Dashboard'} />
  }

  return (
    <MenuContainer>
      <div className="flex h-full items-center gap-x-3">
        <HomePageLink />
        <DashboardLink />
      </div>
      <div className="flex h-full items-center gap-x-6">
        <RoleModeButton />
        <MenuItem href="/orders" text="Orders" />
        {merchantMode ? <MenuItem href="/inventory" text="Inventory" /> : <MerchantLinks />}
        <MenuItem href="/settings" text="Settings" />
      </div>
    </MenuContainer>
  )
}
