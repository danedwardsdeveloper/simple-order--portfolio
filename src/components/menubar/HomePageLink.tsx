import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { mergeClasses } from '@/library/utilities/public'
import CompanyLogo from '../Icons'

export default function HomePageLink() {
	const pathname = usePathname()
	const isActive = pathname === '/'
	return (
		<Link
			href="/"
			className={mergeClasses(
				'flex gap-x-1 items-center h-full  transition-colors duration-300',
				isActive ? 'text-blue-600 cursor-default' : 'text-zinc-600 hover:text-blue-600 active:text-blue-500',
			)}
		>
			<CompanyLogo size="size-6" />
			<span className="font-medium text-xl text-base">Simple Order</span>
		</Link>
	)
}
