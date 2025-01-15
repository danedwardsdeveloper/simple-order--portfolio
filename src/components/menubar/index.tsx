'use client'

import MenuItem, { MenuItemProps } from './MenuItem'
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
  if (!uiSignedIn || !user?.merchantProfile?.slug) {
    displayedMenuItems = landingMenuItems
  } else {
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
  }

  return (
    <nav className="w-full h-10 flex bg-slate-100 items-center px-4">
      <ul className="max-w-2xl w-full mx-auto h-full flex items-center gap-x-4">
        {displayedMenuItems.map((item, index) => (
          <MenuItem key={index} href={item.href} text={item.text} />
        ))}
      </ul>
    </nav>
  )
}
