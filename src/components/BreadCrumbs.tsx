import { ChevronRightIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

interface BreadCrumbItem {
	displayName: string
	href: string
}

// ToDo: These two components are pretty much the same!
// ToDo: Add business name

function Chevron() {
	return <ChevronRightIcon aria-hidden="true" className="size-5 shrink-0 text-zinc-400 ml-4" />
}

interface SignedOutProps {
	trail?: BreadCrumbItem[]
	currentPageTitle: string
}

export function SignedOutBreadCrumbs({ trail, currentPageTitle }: SignedOutProps) {
	return (
		<nav aria-label="Breadcrumb" className="flex mb-12">
			<ol className="flex flex-wrap items-center gap-4">
				<li>
					<div className="flex items-center">
						<Link href="/" className="link-primary">
							Home
						</Link>
						<Chevron />
					</div>
				</li>
				{trail?.map((item) => (
					<li key={item.href}>
						<div className="flex items-center">
							<Link href={item.href} className="link-primary">
								{item.displayName}
							</Link>
							<Chevron />
						</div>
					</li>
				))}
				<li>
					<div className="flex items-center">
						<span aria-current="page" className="font-medium text-blue-600">
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
	demoMode?: boolean
}

export function SignedInBreadCrumbs({ businessName, trail, currentPageTitle, demoMode = false }: SignedInProps) {
	const dashboardHref = demoMode ? '/demo/dashboard' : '/dashboard'

	return (
		<nav aria-label="Breadcrumb" className="flex mb-12">
			<ol className="flex flex-wrap items-center gap-4">
				<li>
					<div className="flex items-center">
						{/* ToDo: This should not be a link if it's the only item */}
						<Link href={dashboardHref} className="link-primary">
							{businessName}
						</Link>
						{((trail && trail?.length > 0) || currentPageTitle) && <Chevron />}
					</div>
				</li>
				{trail?.map((item) => (
					<li key={item.href}>
						<div className="flex items-center">
							<Link href={item.href} className="link-primary">
								{item.displayName}
							</Link>
							<Chevron />
						</div>
					</li>
				))}
				{currentPageTitle && (
					<li>
						<div className="flex items-center">
							<span aria-current="page" className="font-medium text-blue-600">
								{currentPageTitle}
							</span>
						</div>
					</li>
				)}
			</ol>
		</nav>
	)
}
