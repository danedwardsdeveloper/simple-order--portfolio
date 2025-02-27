'use client'

import { useUi } from '@/providers/ui'
import HomePageLink from './HomePageLink'
import MenuItem from './MenuItem'

export default function SignedInMenu() {
	const { merchantMode } = useUi()

	function DashboardLink() {
		return <MenuItem href="/dashboard" text="Dashboard" />
	}

	function MerchantModeLinks() {
		return (
			<>
				<MenuItem href="/inventory" text="Inventory" />
				<MenuItem href="/customers" text="Customers" />
			</>
		)
	}

	function CustomerModeLinks() {
		return <MenuItem href="/merchants" text="Merchants" />
	}

	return (
		<nav className="fixed inset-x-0 top-0 flex h-14 bg-white/70 backdrop-blur border-b-2 border-neutral-100 z-menubar ">
			<div className="w-full max-w-4xl mx-auto px-4 lg:px-0 flex items-center justify-between">
				<div className="flex h-full items-center gap-x-3">
					<HomePageLink />
					<DashboardLink />
				</div>
				<div className="flex h-full items-center gap-x-6">
					<MenuItem href="/orders" text="Orders" />
					{merchantMode ? <MerchantModeLinks /> : <CustomerModeLinks />}
					<MenuItem href="/settings" text="Settings" />
				</div>
			</div>
		</nav>
	)
}
