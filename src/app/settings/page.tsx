'use client'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import Spinner from '@/components/Spinner'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { checkoutSearchParam, checkoutSearchParamValues, userMessages } from '@/library/constants'
import { useNotifications } from '@/providers/notifications'
import { useUser } from '@/providers/user'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef } from 'react'
import SignOutButton from './components/SignOutButton'
import UserInformation from './components/UserInformation'
import TrialExpiryInformation from './components/trialExpiryInformation'

export default function SettingsPage() {
	const searchParams = useSearchParams()
	const subscriptionQuery = searchParams.get(checkoutSearchParam)
	const { user } = useUser()
	const { createNotification } = useNotifications()
	const router = useRouter()
	const notificationShown = useRef(false)

	function clearParams() {
		router.replace(window.location.pathname)
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: <run once on mount>
	useEffect(() => {
		if (subscriptionQuery && !notificationShown.current) {
			notificationShown.current = true

			if (subscriptionQuery === checkoutSearchParamValues.success) {
				createNotification({
					level: 'success',
					title: 'Success',
					message: userMessages.stripeCheckoutSuccess,
				})
				clearParams()
			}
			if (subscriptionQuery === checkoutSearchParamValues.incomplete) {
				createNotification({
					level: 'info',
					title: 'Subscription not started',
					message: userMessages.stripeCheckoutIncomplete,
				})
				clearParams()
			}
		}
	}, [subscriptionQuery, createNotification])

	if (!user) return <UnauthorisedLinks />

	return (
		<Suspense fallback={<Spinner />}>
			<SignedInBreadCrumbs businessName={user.businessName} currentPageTitle="Settings" />
			<div className="flex flex-col gap-y-4 items-start">
				<h1>Settings</h1>

				<UserInformation />
				<TrialExpiryInformation expiry={user.trialExpiry} />
				<SignOutButton />
			</div>
		</Suspense>
	)
}
