'use client'
import { useUi } from '@/components/providers/ui'
import { useUser } from '@/components/providers/user'
import { websiteCopy } from '@/library/constants'
import { mergeClasses } from '@/library/utilities/public'
import { Transition } from '@headlessui/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useDemoUser } from '../providers/demo/user'
import HomePageLink from './HomePageLink'
import { DesktopMenuItem, MobileMenuItem } from './MenuItems'

export default function MenuBar() {
	const pathname = usePathname()
	const { user } = useUser()
	const { demoUser } = useDemoUser()
	const { mobileMenuOpen, toggleMobileMenuOpen, demoMode, setDemoMode } = useUi()

	useEffect(() => {
		if (pathname.startsWith('/demo/')) {
			setDemoMode(true)
		}
	}, [pathname, setDemoMode])

	function demoHref(path: string) {
		return demoMode ? `/demo${path}` : path
	}

	// function DemoBadge() {
	// 	return (
	// 		<>
	// 			<div className="px-3 py-1 flex gap-x-2 rounded border-2 border-orange-600">
	// 				<span className="inline-block text-xl">Demo mode</span>
	// 				<ToggleWithLabel
	// 					enabled={merchantMode}
	// 					setEnabled={(value) => {
	// 						setDemoUser((prev) => ({
	// 							...prev,
	// 							roles: value ? 'merchant' : 'customer',
	// 						}))
	// 						setMerchantMode(value)
	// 					}}
	// 					enabledLabel="Merchant"
	// 					disabledLabel="Customer"
	// 				/>
	// 			</div>
	// 		</>
	// 	)
	// }

	const resolvedUser = demoMode ? demoUser : user
	const notJustACustomer = resolvedUser && (resolvedUser.roles === 'merchant' || resolvedUser.roles === 'both')

	// Enhancement ToDo: Add click outside to close
	function MobileMenu() {
		return (
			<>
				<nav
					data-component="MobileMenu"
					className="flex md:hidden fixed inset-x-0 top-0 h-14 bg-white  border-b-2 border-zinc-200 z-menu backdrop-blur"
				>
					<div className="w-full mx-auto px-5 flex items-center justify-between">
						<HomePageLink />

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
				<BlurredBackdrop />
				<MobilePanel />
			</>
		)
	}

	function BlurredBackdrop() {
		return (
			<Transition
				show={mobileMenuOpen}
				appear={true}
				enter="transition-opacity duration-300 ease-in-out"
				enterFrom="opacity-0"
				enterTo="opacity-100"
				leave="transition-opacity duration-300 ease-in-out"
				leaveFrom="opacity-100"
				leaveTo="opacity-0"
			>
				<div
					data-component="mobile-panel-blurred-backdrop"
					className="fixed md:hidden inset-0 h-screen w-screen backdrop-blur-sm bg-white z-mobile-blurred-backdrop"
				/>
			</Transition>
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
							<Link
								href={websiteCopy.CTAs.howItWorks.href}
								title={websiteCopy.linkDescriptions.howItWorks}
								onClick={toggleMobileMenuOpen}
								className="button-secondary text-center text-xl"
							>
								{websiteCopy.CTAs.howItWorks.displayText}
							</Link>
							<Link href={websiteCopy.CTAs.trial.href} className="button-primary text-center text-xl" onClick={toggleMobileMenuOpen}>
								{websiteCopy.CTAs.trial.displayText}
							</Link>
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
						<HomePageLink />
						{/* {demoMode && <DemoBadge />} */}
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
									<Link href={websiteCopy.CTAs.demo.href} title={websiteCopy.linkDescriptions.howItWorks} className="button-secondary">
										{websiteCopy.CTAs.demo.displayText}
									</Link>
									<Link href={websiteCopy.CTAs.trial.href} className="button-primary">
										{websiteCopy.CTAs.trial.displayText}
									</Link>
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
