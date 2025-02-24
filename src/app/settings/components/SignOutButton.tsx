'use client'
import type { SignOutPOSTresponse } from '@/app/api/authentication/sign-out/route'
import { apiPaths, dataTestIdNames } from '@/library/constants'
import logger from '@/library/logger'
import { useUser } from '@/providers/user'

export default function SignOutButton() {
	const { setUser } = useUser()

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
