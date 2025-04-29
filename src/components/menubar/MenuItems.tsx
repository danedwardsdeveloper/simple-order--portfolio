import { mergeClasses } from '@/library/utilities/public'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function DesktopMenuItem({ href, text }: { href: string; text: string }) {
	const pathname = usePathname()

	// Not sure this will handle the homepage properly...
	const isActive = pathname.includes(href)
	return (
		<Link
			href={href}
			className={mergeClasses(
				'font-medium transition-colors duration-300',
				isActive ? 'text-blue-600 cursor-default' : 'text-zinc-600 hover:text-blue-600 active:text-blue-500',
			)}
		>
			{text}
		</Link>
	)
}

export function MobileMenuItem({ href, text, onClick }: { href: string; text: string; onClick: () => void }) {
	const pathname = usePathname()
	const isActive = pathname.includes(href)
	return (
		<Link
			href={href}
			onClick={onClick}
			className={mergeClasses(
				'font-medium text-xl transition-colors duration-300',
				isActive ? 'text-blue-600 cursor-default' : 'text-zinc-600 hover:text-blue-600 active:text-blue-500',
			)}
		>
			{text}
		</Link>
	)
}
