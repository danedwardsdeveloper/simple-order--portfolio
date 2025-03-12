'use client'
import type { SignOutPOSTresponse } from '@/app/api/authentication/sign-out/route'
import { apiPaths, dataTestIdNames } from '@/library/constants'
import logger from '@/library/logger'
import { useUser } from '@/providers/user'

export default function SignOutButton() {
	const { setUser, setInventory, setConfirmedCustomers, setConfirmedMerchants, setInvitationsReceived, setInvitationsSent } = useUser()

	async function handleSignOut() {
		const response = await fetch(apiPaths.authentication.signOut, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		})

		const { message }: SignOutPOSTresponse = await response.json()

		if (message === 'success') {
			setUser(null)
			setConfirmedCustomers(null)
			setInventory(null)
			setConfirmedMerchants(null)
			setInvitationsReceived(null)
			setInvitationsSent(null)
		} else {
			logger.error('Error signing out: ', message)
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
