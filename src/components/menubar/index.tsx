'use client'

import { websiteCopy } from '@/library/constants'
import { useUi } from '@/providers/ui'
import { useUser } from '@/providers/user'
import { Transition } from '@headlessui/react'
import clsx from 'clsx'
import Link from 'next/link'
import HomePageLink from './HomePageLink'
import { DesktopMenuItem, MobileMenuItem } from './MenuItems'

export default function MenuBar() {
	const { user } = useUser()
	const { mobileMenuOpen, toggleMobileMenuOpen } = useUi()

	// Add click outside to close
	function MobileMenu() {
		return (
			<>
				<nav
					data-component="MobileMenu"
					className="flex md:hidden fixed inset-x-0 top-0 h-14 bg-white/70  border-b-2 border-neutral-100 z-menu"
				>
					<div className="w-full mx-auto px-5 flex items-center justify-between">
						<HomePageLink />
						<button
							type="button"
							onClick={() => toggleMobileMenuOpen()}
							className={clsx(
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
					className="fixed md:hidden inset-0 h-screen w-screen backdrop-blur-sm bg-white/50 z-mobile-blurred-backdrop"
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
								className="button-secondary text-center text-xl"
							>
								{websiteCopy.CTAs.secondary.displayText}
							</Link>
							<Link href={websiteCopy.CTAs.primary.href} className="button-primary text-center text-xl" onClick={toggleMobileMenuOpen}>
								{websiteCopy.CTAs.primary.displayText}
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
				className="hidden md:flex fixed inset-x-0 top-0 h-14 bg-white/70 backdrop-blur border-b-2 border-neutral-100 z-menu"
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
