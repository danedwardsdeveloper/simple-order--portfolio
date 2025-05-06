'use client'
import type { SignOutPOSTresponse } from '@/app/api/authentication/sign-out/route'
import { useNotifications } from '@/components/providers/notifications'
import { useUser } from '@/components/providers/user'
import { dataTestIdNames, userMessages } from '@/library/constants'
import { apiRequest } from '@/library/utilities/public'

export default function SignOutButton() {
	const { setUser, setInventory, setConfirmedCustomers, setConfirmedMerchants, setInvitationsReceived, setInvitationsSent } = useUser()
	const { createNotification } = useNotifications()

	async function handleSignOut() {
		const { ok, userMessage } = await apiRequest<SignOutPOSTresponse>({
			basePath: '/authentication/sign-out',
			method: 'POST',
		})

		if (ok) {
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
