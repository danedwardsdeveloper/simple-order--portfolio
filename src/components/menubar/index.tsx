'use client'

import MenuItem, { MenuItemProps } from './MenuItem'
import RoleModeButton from './RoleModeButton'
import { useUi } from '@/providers/ui'

const landingMenuItems: MenuItemProps[] = [
  {
    text: 'Home',
    href: '/',
  },
  {
    text: 'Blog',
    href: '/blog',
  },
  {
    text: 'Create account',
    href: '/create-account',
  },
  {
    text: 'Sign in',
    href: '/sign-in',
  },
]

export default function MenuBar() {
  const { uiSignedIn, user } = useUi()

  let displayedMenuItems: MenuItemProps[]
  if (!uiSignedIn || !user) {
    displayedMenuItems = landingMenuItems
  } else if (user.role === 'merchant' && user.merchantProfile) {
    const merchantSlug = user.merchantProfile?.slug
    displayedMenuItems = [
      {
        text: 'Orders',
        href: `/${merchantSlug}`,
      },
      {
        text: 'Inventory',
        href: `/${merchantSlug}/inventory`,
      },
      {
        text: 'Customers',
        href: `/${merchantSlug}/customers`,
      },
      {
        text: 'Settings',
        href: `/${merchantSlug}/settings`,
      },
    ]
  } else {
    displayedMenuItems = [
      {
        text: 'Orders',
        href: `/orders`,
      },
      {
        text: 'Account',
        href: `/account`,
      },
    ]
  }

  function renderRoleModeButton() {
    if (user?.role === 'both') {
      return <RoleModeButton />
    }
  }

  return (
    <nav className="w-full h-10 flex bg-slate-100 items-center px-4">
      <ul className="max-w-2xl w-full mx-auto h-full flex items-center gap-x-4">
        {displayedMenuItems.map((item, index) => (
          <MenuItem key={index} href={item.href} text={item.text} />
        ))}
        {renderRoleModeButton()}
      </ul>
    </nav>
  )
}
