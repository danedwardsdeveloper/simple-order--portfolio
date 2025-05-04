import { ChevronRightIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

interface BreadCrumbItem {
	displayName: string
	href: string
}

// ToDo: These two components are pretty much the same!
// ToDo: Add business name

interface SignedOutProps {
	trail?: BreadCrumbItem[]
	currentPageTitle: string
}

export function SignedOutBreadCrumbs({ trail, currentPageTitle }: SignedOutProps) {
	return (
		<nav aria-label="Breadcrumb" className="flex mb-12">
			<ol className="flex items-center space-x-4">
				<li>
					<div className="flex items-center">
						<Link href="/" className="link-primary">
							Home
						</Link>
					</div>
				</li>
				{trail?.map((item) => (
					<li key={item.href}>
						<div className="flex items-center">
							<ChevronRightIcon aria-hidden="true" className="size-5 shrink-0 text-zinc-400" />
							<Link href={item.href} className="link-primary ml-4">
								{item.displayName}
							</Link>
						</div>
					</li>
				))}
				<li>
					<div className="flex items-center">
						<ChevronRightIcon aria-hidden="true" className="size-5 shrink-0 text-zinc-400" />
						<span aria-current="page" className="ml-4 font-medium text-blue-600">
							{currentPageTitle}
						</span>
					</div>
				</li>
			</ol>
		</nav>
	)
}

interface SignedInProps {
	businessName: string
	trail?: BreadCrumbItem[]
	currentPageTitle?: string
}

export function SignedInBreadCrumbs({ businessName, trail, currentPageTitle }: SignedInProps) {
	return (
		<nav aria-label="Breadcrumb" className="flex mb-12">
			<ol className="flex items-center space-x-4">
				<li>
					<div className="flex items-center">
						{/* ToDo: This should not be a link if it's the only item */}
						<Link href="/dashboard" className="link-primary">
							{businessName}
						</Link>
					</div>
				</li>
				{trail?.map((item) => (
					<li key={item.href}>
						<div className="flex items-center">
							<ChevronRightIcon aria-hidden="true" className="size-5 shrink-0 text-zinc-400" />
							<Link href={item.href} className="link-primary ml-4">
								{item.displayName}
							</Link>
						</div>
					</li>
				))}
				{currentPageTitle && (
					<li>
						<div className="flex items-center">
							<ChevronRightIcon aria-hidden="true" className="size-5 shrink-0 text-zinc-400" />
							<span aria-current="page" className="ml-4 font-medium text-blue-600">
								{currentPageTitle}
							</span>
						</div>
					</li>
				)}
			</ol>
		</nav>
	)
}
