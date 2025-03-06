import CompanyLogo from './Icons'

type NavigationItem = {
	name: string
	href: string
}

type NavigationMap = {
	[key: string]: NavigationItem[]
}

const navigationMap: NavigationMap = {
	Legal: [
		{ name: 'Terms of service', href: '/articles/terms-of-service' },
		{ name: 'Privacy policy', href: '/articles/privacy-policy' },
		{ name: 'Cookie policy', href: '/articles/cookie-policy' },
		{ name: 'GDPR compliance', href: '/articles/gdpr-compliance' },
	],
}

function LinksColumn({ section }: { section: keyof typeof navigationMap }) {
	const links = navigationMap[section]

	return (
		<div>
			<h3 className="text-sm/6 font-semibold text-gray-950">{section}</h3>
			<ul className="mt-6 space-y-4">
				{links.map((item) => (
					<li key={item.name}>
						<a href={item.href} className="text-sm/6 link-primary">
							{item.name}
						</a>
					</li>
				))}
			</ul>
		</div>
	)
}

export default function Footer() {
	return (
		<footer className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
			<div className="mt-24 border-t border-gray-900/10 pt-12 xl:grid xl:grid-cols-3 xl:gap-8">
				<div className=" xl:col-span-2 size-7 text-zinc-600">
					<CompanyLogo />
				</div>

				<div className="mt-16 xl:mt-0">
					<div>
						{Object.keys(navigationMap).map((linksColumn) => (
							<LinksColumn key={linksColumn} section={linksColumn} />
						))}
					</div>
				</div>
			</div>

			<div className="mt-12 border-t border-gray-900/10 pt-8 md:flex md:items-center md:justify-between">
				<p className="mt-8 text-sm/6 text-gray-600 md:order-1 md:mt-0">&copy; {new Date().getFullYear()}, Simple Order</p>
			</div>
		</footer>
	)
}
