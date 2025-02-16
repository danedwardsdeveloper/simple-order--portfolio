import { ChevronRightIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

export default function BreadCrumbs({ title }: { title: string }) {
	return (
		<nav aria-label="Breadcrumb" className="flex mb-12">
			<ol className="flex items-center space-x-4">
				<li>
					<div className="flex items-center">
						<Link href="/articles" className="text-sm font-medium text-zinc-500 hover:text-zinc-700  transition-colors duration-300">
							Articles
						</Link>
					</div>
				</li>
				<li>
					<div className="flex items-center">
						<ChevronRightIcon aria-hidden="true" className="size-5 shrink-0 text-zinc-400" />
						<span aria-current="page" className="ml-4 text-sm font-medium text-blue-400">
							{title}
						</span>
					</div>
				</li>
			</ol>
		</nav>
	)
}
