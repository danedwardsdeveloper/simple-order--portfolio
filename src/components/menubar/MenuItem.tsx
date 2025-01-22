import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MenuItem({ href, text }: { href: string; text: string }) {
  const pathname = usePathname()
  const isActive = pathname === href
  return (
    <Link
      href={href}
      className={clsx(
        'font-medium text-sm transition-colors duration-300',
        isActive ? 'text-blue-400 cursor-default' : 'text-zinc-600 hover:text-blue-400 active:text-blue-500',
      )}
    >
      {text}
    </Link>
  )
}
