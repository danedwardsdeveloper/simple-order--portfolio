'use client'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import UserInformation from '@/components/UserInformation'
import { useDemoUser } from '@/components/providers/demo/user'
import DemoMerchantSettings from './DemoMerchantSettings'

export default function DemoSettingsPage() {
	const { demoUser } = useDemoUser()

	return (
		<>
			<SignedInBreadCrumbs businessName={demoUser.businessName} currentPageTitle="Settings" demoMode />
			<div className="flex flex-col gap-y-4 items-start">
				<h1>Settings</h1>
				<UserInformation user={demoUser} />

				{demoUser.roles !== 'customer' && <DemoMerchantSettings demoUser={demoUser} />}
			</div>
		</>
	)
}
