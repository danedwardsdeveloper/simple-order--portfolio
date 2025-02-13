'use client'

import HomePageLink from './HomePageLink'
import MenuContainer from './MenuContainer'
import MenuItem from './MenuItem'
import RoleModeButton from './RoleModeButton'
import { useUi } from '@/providers/ui'

export default function SignedInMenu() {
  const { merchantMode } = useUi()

  function DashboardLink() {
    return <MenuItem href="/dashboard" text="Dashboard" />
  }

  function MerchantModeLinks() {
    return (
      <>
        <MenuItem href="/inventory" text="Inventory" />
        <MenuItem href="/customers" text="Customers" />
      </>
    )
  }

  function CustomerModeLinks() {
    return <MenuItem href="/merchants" text="Merchants" />
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
        {merchantMode ? <MerchantModeLinks /> : <CustomerModeLinks />}
        <MenuItem href="/settings" text="Settings" />
      </div>
    </MenuContainer>
  )
}
