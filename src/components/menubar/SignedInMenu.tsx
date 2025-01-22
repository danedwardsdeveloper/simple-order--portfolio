'use client'

import Link from 'next/link'

import CompanyLogo from '../Icons'
import MenuContainer from './MenuContainer'
import MenuItem from './MenuItem'
import MerchantLinks from './MerchantLinks'
import RoleModeButton from './RoleModeButton'
import { useUi } from '@/providers/ui'

const dynamicMenuItems: { href: string; text: string }[] = [
  {
    href: '',
    text: '',
  },
  {
    href: '',
    text: '',
  },
]

export default function SignedInMenu() {
  const { user, roleMode } = useUi()

  const displayName = user?.merchantProfile?.businessName || user?.businessNameAsCustomer || ''

  const DisplayNameComponent = displayName ? (
    <span className="font-medium text-sm text-zinc-500">{displayName}</span>
  ) : null

  return (
    <MenuContainer>
      <div className="flex h-full items-center gap-x-3">
        <Link
          href="/"
          className="flex gap-x-1 items-center h-full text-zinc-600 hover:text-blue-400 active:text-blue-500 transition-colors duration-300"
        >
          <div className="size-6 ">
            <CompanyLogo />
          </div>
          <span className="font-medium text-sm">Simple Order</span>
        </Link>
        {DisplayNameComponent}
      </div>
      <div className="flex h-full items-center gap-x-6">
        <RoleModeButton />
        <MenuItem href="#" text="Orders" />
        {roleMode === 'merchant' ? <MenuItem href="#" text="Inventory" /> : <MerchantLinks />}
        <MenuItem href="#" text="Settings" />
      </div>
    </MenuContainer>
  )
}
