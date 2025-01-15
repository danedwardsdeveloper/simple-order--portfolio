'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export interface MenuItemProps {
  text: string
  href: string
}

export default function MenuItem({ text, href }: MenuItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname?.endsWith(`${href}/`)

  return (
    <Link
      href={href}
      className={clsx(
        'inline-block underline-offset-2', //
        isActive ? 'text-black cursor-default underline' : 'text-zinc-500 hover:underline',
      )}
    >
      {text}
    </Link>
  )
}
