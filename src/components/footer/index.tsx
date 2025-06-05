import { articlePath } from '@/library/utilities/public'
import CompanyLogo from '../Icons'
import FooterLink from './FooterLink'

type NavigationMap = {
	[key: string]: Array<{
		name: string
		href: string
	}>
}

const navigationMap: NavigationMap = {
	Company: [
		{ name: 'How it works', href: articlePath('how-it-works') },
		{ name: 'About', href: articlePath('about') },
		{ name: 'Articles', href: '/articles' },
		{ name: 'Sign in', href: '/sign-in' },
	],
	Legal: [
		{ name: 'Terms of service', href: articlePath('terms-of-service') },
		{ name: 'Privacy policy', href: articlePath('privacy-policy') },
		{ name: 'Cookie policy', href: articlePath('cookie-policy') },
		{ name: 'GDPR compliance', href: articlePath('gdpr-compliance') },
	],
}

function LinksColumn({ section }: { section: keyof typeof navigationMap }) {
	const links = navigationMap[section]

	return (
		<div className="mt-16 xl:mt-0">
			<h3 className="leading-6 font-semibold text-gray-950">{section}</h3>
			<ul className="mt-6 space-y-4">
				{links.map((item) => (
					<li key={item.name}>
						<FooterLink name={item.name} href={item.href} />
					</li>
				))}
			</ul>
		</div>
	)
}

export default function Footer() {
	return (
		<footer className="w-full mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
			<div className="mt-24 border-t border-gray-900/10 pt-12 xl:grid xl:grid-cols-3 xl:gap-8">
				<div className=" xl:col-span-2">
					<CompanyLogo colour="text-zinc-600" />
				</div>

				<div className="md:grid md:grid-cols-2 md:gap-8">
					{Object.keys(navigationMap).map((linksColumn) => (
						<LinksColumn key={linksColumn} section={linksColumn} />
					))}
				</div>
			</div>

			<div className="mt-12 border-t border-gray-900/10 pt-8 md:flex md:items-center md:justify-between">
				<p className="mt-8 leading-6 text-gray-600 md:order-1 md:mt-0">&copy; {new Date().getFullYear()}, Simple Order</p>
			</div>
		</footer>
	)
}
