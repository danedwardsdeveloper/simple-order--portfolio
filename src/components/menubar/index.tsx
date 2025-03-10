'use client'

import { websiteCopy } from '@/library/constants'
import { useUi } from '@/providers/ui'
import { useUser } from '@/providers/user'
import clsx from 'clsx'
import Link from 'next/link'
import HomePageLink from './HomePageLink'
import { DesktopMenuItem, MobileMenuItem } from './MenuItems'

export default function MenuBar() {
	const { user } = useUser()
	const { mobileMenuOpen, toggleMobileMenuOpen } = useUi()

	function MobileMenu() {
		return (
			<>
				<nav
					data-component="MobileMenu"
					className="flex md:hidden fixed inset-x-0 top-0 h-14 bg-white/70 backdrop-blur border-b-2 border-neutral-100 z-menubar"
				>
					<div className="w-full mx-auto px-4 lg:px-8 flex items-center justify-between">
						<HomePageLink />
						<button
							type="button"
							onClick={() => toggleMobileMenuOpen()}
							className={clsx(
								' px-2 rounded-md border-2 border-blue-200 font-medium',
								mobileMenuOpen ? 'font-bold border-opacity-100' : ' text-zinc-600 border-opacity-0',
							)}
						>
							Menu
						</button>
					</div>
				</nav>
				{mobileMenuOpen && <MobilePanel />}
			</>
		)
	}

	function MobilePanel() {
		return (
			<>
				<div className="fixed md:hidden inset-0 h-screen w-screen backdrop-blur-sm bg-white/50 z-0" />
				<div className="flex flex-col md:hidden fixed inset-x-0 top-14 border-b-2 border-blue-200 z-menubar bg-blue-50 p-3 gap-y-6 pb-4">
					{user ? (
						<>
							<MobileMenuItem onClick={toggleMobileMenuOpen} href="/dashboard" text="Dashboard" />
							{user.roles !== 'customer' && (
								<>
									<MobileMenuItem onClick={toggleMobileMenuOpen} href="/inventory" text="Inventory" />
									<MobileMenuItem onClick={toggleMobileMenuOpen} href="/customers" text="Customers" />
								</>
							)}
							<MobileMenuItem onClick={toggleMobileMenuOpen} href="/orders" text="Orders" />
							<MobileMenuItem onClick={toggleMobileMenuOpen} href="/settings" text="Settings" />
						</>
					) : (
						<>
							<MobileMenuItem onClick={toggleMobileMenuOpen} href="/articles" text="Articles" />
							<MobileMenuItem onClick={toggleMobileMenuOpen} href="/sign-in" text="Sign in" />
							<Link
								href={websiteCopy.CTAs.secondary.href}
								title={websiteCopy.linkDescriptions.howItWorks}
								onClick={toggleMobileMenuOpen}
								className="button-secondary text-center"
							>
								{websiteCopy.CTAs.secondary.displayText}
							</Link>
							<Link href={websiteCopy.CTAs.primary.href} className="button-primary text-center" onClick={toggleMobileMenuOpen}>
								{websiteCopy.CTAs.primary.displayText}
							</Link>
						</>
					)}
				</div>
			</>
		)
	}

	function DesktopMenu() {
		return (
			<nav
				data-component="DesktopMenu"
				className="hidden md:flex fixed inset-x-0 top-0  h-14 bg-white/70 backdrop-blur border-b-2 border-neutral-100 z-menubar"
			>
				<div className="w-full max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between">
					{user ? (
						<>
							<div className="flex h-full items-center gap-x-3">
								<HomePageLink />
							</div>
							<div className="flex h-full items-center gap-x-6">
								<DesktopMenuItem href="/dashboard" text="Dashboard" />
								{user.roles !== 'customer' && (
									<>
										<DesktopMenuItem href="/inventory" text="Inventory" />
										<DesktopMenuItem href="/customers" text="Customers" />
									</>
								)}
								<DesktopMenuItem href="/orders" text="Orders" />
								<DesktopMenuItem href="/settings" text="Settings" />
							</div>
						</>
					) : (
						<>
							<HomePageLink />
							<div className="flex h-full items-center gap-x-6">
								<DesktopMenuItem href="/articles" text="Articles" />
								<DesktopMenuItem href="/sign-in" text="Sign in" />
								<div className="flex gap-x-2 items-center">
									<Link href={websiteCopy.CTAs.secondary.href} title={websiteCopy.linkDescriptions.howItWorks} className="button-secondary">
										{websiteCopy.CTAs.secondary.displayText}
									</Link>
									<Link href={websiteCopy.CTAs.primary.href} className="button-primary">
										{websiteCopy.CTAs.primary.displayText}
									</Link>
								</div>
							</div>
						</>
					)}
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
