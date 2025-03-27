'use client'
import type { SignOutPOSTresponse } from '@/app/api/authentication/sign-out/route'
import { apiPaths, dataTestIdNames, userMessages } from '@/library/constants'
import { useNotifications } from '@/providers/notifications'
import { useUser } from '@/providers/user'

export default function SignOutButton() {
	const { setUser, setInventory, setConfirmedCustomers, setConfirmedMerchants, setInvitationsReceived, setInvitationsSent } = useUser()
	const { createNotification } = useNotifications()

	async function handleSignOut() {
		const response = await fetch(apiPaths.authentication.signOut, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		})

		if (response.ok) {
			setUser(null)
			setConfirmedCustomers(null)
			setInventory(null)
			setConfirmedMerchants(null)
			setInvitationsReceived(null)
			setInvitationsSent(null)
			createNotification({
				level: 'success',
				title: 'Success',
				message: userMessages.signedOutSuccessfully,
			})
			return
		}

		const { userMessage }: SignOutPOSTresponse = await response.json()

		if (userMessage) {
			createNotification({
				level: 'error',
				title: 'Error',
				message: userMessage,
			})
		}
	}

	return (
		<button
			type="button"
			data-test-id={dataTestIdNames.account.signOutButton}
			onClick={handleSignOut}
			className="button-secondary max-w-xs"
		>
			Sign out
		</button>
	)
}
