'use client'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import Spinner from '@/components/Spinner'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { useNotifications } from '@/components/providers/notifications'
import { updateUserData, useUser } from '@/components/providers/user'
import { checkoutSearchParam, checkoutSearchParamValues, userMessages } from '@/library/constants'
import { apiRequestNew } from '@/library/utilities/public'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef } from 'react'
import UserInformation from '../../components/UserInformation'
import type { VerifyTokenGETresponse } from '../api/authentication/verify-token/get'
import { CustomerSettings } from './components/CustomerSettings'
import MerchantSettings from './components/MerchantSettings'
import PortalButton from './components/PortalButton'
import SignOutButton from './components/SignOutButton'
import TrialExpiryInformation from './components/TrialExpiryInformation'

export default function SettingsPage() {
	// Move this logic entirely somewhere else, like /settings/subscription
	const searchParams = useSearchParams()
	const subscriptionQuery = searchParams.get(checkoutSearchParam)
	const {
		user,
		setUser,
		setInventory,
		setConfirmedCustomers,
		setConfirmedMerchants,
		setInvitationsReceived,
		setInvitationsSent,
		setOrdersMade,
		setOrdersReceived,
	} = useUser()
	const { createNotification } = useNotifications()
	const router = useRouter()
	const notificationShown = useRef(false)

	function clearParams() {
		router.replace(window.location.pathname)
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies:
	useEffect(() => {
		async function refreshUser() {
			const { userData } = await apiRequestNew<VerifyTokenGETresponse>({
				basePath: '/authentication/verify-token',
			})

			// ToDo: I can't remember why you would want to refresh all the data? Monday 2 June 2025
			if (userData) {
				updateUserData(userData, {
					setUser,
					setInventory,
					setConfirmedCustomers,
					setConfirmedMerchants,
					setInvitationsReceived,
					setInvitationsSent,
					setOrdersMade,
					setOrdersReceived,
				})
			}
		}

		if (subscriptionQuery && !notificationShown.current) {
			notificationShown.current = true

			if (subscriptionQuery === checkoutSearchParamValues.success) {
				refreshUser()

				createNotification({
					level: 'success',
					title: 'Success',
					message: userMessages.stripeCheckoutSuccess,
				})
				clearParams()
			}

			if (subscriptionQuery === checkoutSearchParamValues.incomplete) {
				refreshUser()

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

				<UserInformation user={user} />

				{(() => {
					if (user.roles === 'customer') {
						return <CustomerSettings />
					}

					return (
						<>
							<MerchantSettings merchant={user} />
							<TrialExpiryInformation />
							<PortalButton
								subscriptionEnd={user.subscriptionEnd} //
							/>
						</>
					)
				})()}

				<SignOutButton />
			</div>
		</Suspense>
	)
}
