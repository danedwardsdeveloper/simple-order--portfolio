'use client'
import Spinner from '@/components/Spinner'
import { apiPaths, dataTestIdNames } from '@/library/constants'
import { useNotifications } from '@/providers/notifications'
import { useUser } from '@/providers/user'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { AuthenticationEmailConfirmPOSTbody, AuthenticationEmailConfirmPOSTresponse } from '../api/authentication/email/confirm/route'

export default function ConfirmEmailResponse() {
	const searchParams = useSearchParams()
	const token = searchParams.get('token')
	const { setUser } = useUser()
	const { createNotification } = useNotifications()
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(true)
	const [message, setMessage] = useState<string | null>(null)

	// biome-ignore lint/correctness/useExhaustiveDependencies:
	useEffect(() => {
		async function confirmEmail() {
			if (!token) return
			try {
				const { message, confirmedUser }: AuthenticationEmailConfirmPOSTresponse = await (
					await fetch(apiPaths.authentication.email.confirm, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ token } satisfies AuthenticationEmailConfirmPOSTbody),
					})
				).json()

				if (confirmedUser) setUser(confirmedUser)
				if (message === 'success') {
					createNotification({
						level: 'success',
						title: 'Success',
						message: 'Thank you for confirming your email',
					})
					router.push('/dashboard')
				} else if (message === 'already confirmed') {
					createNotification({
						level: 'info',
						title: 'Already confirmed',
						message: 'Your email address was already confirmed',
					})
					router.push('/dashboard')
				} else {
					setMessage(message)
				}
			} catch {
				setMessage('An error occurred while confirming your email')
			} finally {
				setIsLoading(false)
			}
		}

		if (token) {
			confirmEmail()
		}
	}, [token])

	if (isLoading)
		return (
			<>
				<h1>Confirming your email...</h1>
				<Spinner />
			</>
		)

	return (
		<>
			{isLoading && (
				<div data-test-id={dataTestIdNames.emailConfirmation.loading} className="flex gap-x-2">
					<Spinner />
					<span>Confirming your email...</span>
				</div>
			)}

			{!isLoading && message && <div data-test-id={dataTestIdNames.emailConfirmation.response}>{message}</div>}
		</>
	)
}
