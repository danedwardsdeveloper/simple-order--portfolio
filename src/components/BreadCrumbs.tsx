import { ChevronRightIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

interface BreadCrumbItem {
	displayName: string
	href: string
}

interface Props {
	home: 'landingPage' | 'dashboard'
	trail?: BreadCrumbItem[]
	currentPageTitle: string
}

// ToDo: Add business name

function UserItem() {
	return (
		<li>
			<div className="flex items-center">
				<Link href="/dashboard" className="link-primary">
					Dashboard
				</Link>
			</div>
		</li>
	)
}

function LandingPageItem() {
	return (
		<li>
			<div className="flex items-center">
				<Link href="/" className="link-primary">
					Home
				</Link>
			</div>
		</li>
	)
}

export default function BreadCrumbs({ home, trail, currentPageTitle }: Props) {
	return (
		<nav aria-label="Breadcrumb" className="flex mb-12">
			<ol className="flex items-center space-x-4">
				{home === 'landingPage' ? <LandingPageItem /> : <UserItem />}
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
						<span aria-current="page" className="ml-4 text-sm font-medium text-blue-400">
							{currentPageTitle}
						</span>
					</div>
				</li>
			</ol>
		</nav>
	)
}
