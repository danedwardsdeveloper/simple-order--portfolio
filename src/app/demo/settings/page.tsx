'use client'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import UserInformation from '@/components/UserInformation'
import { useDemoUser } from '@/components/providers/demo/user'
import DemoMerchantSettings from './DemoMerchantSettings'

export default function DemoSettingsPage() {
	const { resolvedUser } = useDemoUser()

	return (
		<>
			<SignedInBreadCrumbs businessName={resolvedUser.businessName} currentPageTitle="Settings" isDemo={true} />
			<div className="flex flex-col gap-y-4 items-start">
				<h1>Settings</h1>
				<UserInformation user={resolvedUser} />

				{resolvedUser.roles !== 'customer' && <DemoMerchantSettings demoUser={resolvedUser} />}
			</div>
		</>
	)
}
