'use client'
import { apiPaths, dataTestIdNames } from '@/library/constants'
import { useAuthorisation } from '@/providers/authorisation'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
	const { setClientSafeUser } = useAuthorisation()
	const router = useRouter()

	async function handleSignOut() {
		const response = await fetch(apiPaths.authentication.signOut, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		})

		if (response.ok) {
			setClientSafeUser(null)
			// ToDo: Create notification
			router.push('/')
		} else {
			// ToDo
		}
	}

	return (
		<button type="button" data-test-id={dataTestIdNames.account.signOutButton} onClick={handleSignOut} className="button-secondary">
			Sign out
		</button>
	)
}
