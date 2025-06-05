'use client'
import { useUi } from '@/components/providers/ui'
import { useUser } from '@/components/providers/user'
import { mergeClasses } from '@/library/utilities/public'
import { Transition } from '@headlessui/react'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import CtaPair from '../CtaPair'
import { useDemoUser } from '../providers/demo/user'
import BlurredBackdrop from './BlurredBackdrop'
import HomePageLink from './HomePageLink'
import { DesktopMenuItem, MobileMenuItem } from './MenuItems'

export default function MenuBar() {
	const pathname = usePathname()
	const { user } = useUser()
	const { resolvedUser: resolvedDemoUser } = useDemoUser()
	const { mobileMenuOpen, setMobileMenuOpen, toggleMobileMenuOpen, demoMode, setDemoMode } = useUi()

	useEffect(() => {
		if (pathname.startsWith('/demo/')) {
			setDemoMode(true)
		}
	}, [pathname, setDemoMode])

	const alreadyOnHomePage = pathname === '/'

	function demoHref(path: string) {
		return demoMode ? `/demo${path}` : path
	}

	const resolvedUser = demoMode ? resolvedDemoUser : user

	const notJustACustomer = resolvedUser && (resolvedUser.roles === 'merchant' || resolvedUser.roles === 'both')

	function MobileMenu() {
		return (
			<>
				<nav
					data-component="MobileMenu"
					className="flex md:hidden fixed inset-x-0 top-0 h-14 bg-white  border-b-2 border-zinc-200 z-menu backdrop-blur"
				>
					<div className="w-full mx-auto px-5 flex items-center justify-between">
						<HomePageLink onClick={() => setMobileMenuOpen(false)} alreadyOnHomePage={alreadyOnHomePage} />

						<button
							type="button"
							onClick={() => toggleMobileMenuOpen()}
							className={mergeClasses(
								' px-2 rounded-md border-2 border-blue-200 font-medium text-xl',
								mobileMenuOpen ? 'font-bold border-opacity-100' : ' text-zinc-600 border-opacity-0',
							)}
						>
							Menu
						</button>
					</div>
				</nav>
				<BlurredBackdrop mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
				<MobilePanel />
			</>
		)
	}

	function MobilePanel() {
		return (
			<Transition
				show={mobileMenuOpen}
				appear={true}
				enter="transition-[max-height,opacity] duration-500 ease-out"
				enterFrom="max-h-0 opacity-0"
				enterTo="max-h-96 opacity-100"
				leave="transition-[max-height,opacity] duration-500 ease-in-out"
				leaveFrom="max-h-96 opacity-100"
				leaveTo="max-h-0 opacity-0"
			>
				<div className="flex flex-col md:hidden fixed inset-x-0 top-14 border-b-2 border-blue-200 z-menu bg-blue-50 p-5 gap-y-10 py-10 overflow-hidden">
					{resolvedUser ? (
						<>
							<MobileMenuItem onClick={toggleMobileMenuOpen} href={demoHref('/dashboard')} text="Dashboard" />
							{notJustACustomer && (
								<>
									<MobileMenuItem onClick={toggleMobileMenuOpen} href={demoHref('/inventory')} text="Inventory" />
									<MobileMenuItem onClick={toggleMobileMenuOpen} href={demoHref('/customers')} text="Customers" />
								</>
							)}
							<MobileMenuItem onClick={toggleMobileMenuOpen} href={demoHref('/orders')} text="Orders" />
							<MobileMenuItem onClick={toggleMobileMenuOpen} href={demoHref('/settings')} text="Settings" />
						</>
					) : (
						<>
							<MobileMenuItem onClick={toggleMobileMenuOpen} href="/articles" text="Articles" />
							<MobileMenuItem onClick={toggleMobileMenuOpen} href="/sign-in" text="Sign in" />
							<CtaPair startWith="secondary" dualStyles="text-center" onClick={() => setMobileMenuOpen(false)} />
						</>
					)}
				</div>
			</Transition>
		)
	}

	function DesktopMenu() {
		return (
			<nav
				data-component="DesktopMenu"
				className="hidden md:flex fixed inset-x-0 top-0 h-14 bg-white backdrop-blur border-b-2 border-zinc-200 z-menu"
			>
				<div className="w-full max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between">
					<div className="flex gap-x-2 items-center">
						<HomePageLink alreadyOnHomePage={alreadyOnHomePage} />
					</div>
					<div className="flex h-full items-center gap-x-6">
						{resolvedUser ? (
							<>
								<DesktopMenuItem href={demoHref('/dashboard')} text="Dashboard" />
								{notJustACustomer && (
									<>
										<DesktopMenuItem href={demoHref('/inventory')} text="Inventory" />
										<DesktopMenuItem href={demoHref('/customers')} text="Customers" />
									</>
								)}
								<DesktopMenuItem href={demoHref('/orders')} text="Orders" />
								<DesktopMenuItem href={demoHref('/settings')} text="Settings" />
							</>
						) : (
							<>
								<DesktopMenuItem href="/articles" text="Articles" />
								<DesktopMenuItem href="/sign-in" text="Sign in" />
								<div className="flex gap-x-2 items-center">
									<CtaPair />
								</div>
							</>
						)}
					</div>
				</div>
			</nav>
		)
	}

	return (
		<>
			<DesktopMenu />
			<MobileMenu />
		</>
	)
}
