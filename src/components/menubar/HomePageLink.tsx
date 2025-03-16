import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { mergeClasses } from '@/library/utilities'
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
			<div className="size-6 ">
				<CompanyLogo />
			</div>
			<span className="font-medium text-xl md:text-sm">Simple Order</span>
		</Link>
	)
}
