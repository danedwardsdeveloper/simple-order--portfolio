'use client'
import Spinner from '@/components/Spinner'
import { apiPaths, dataTestIdNames } from '@/library/constants'
import { useUser } from '@/providers/user'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { ConfirmEmailPOSTbody, ConfirmEmailPOSTresponse } from '../api/authentication/email/confirm/route'

export default function ConfirmEmailResponse() {
	const searchParams = useSearchParams()
	const token = searchParams.get('token')
	const { setUser } = useUser()
	const [isLoading, setIsLoading] = useState(true)
	const [message, setMessage] = useState<string | null>(null)

	// ToDo: This needs a lot of work.
	// The message needs to be more welcoming!
	// Plus it should handle the edge case where a user confirms the email with a different browser.

	// biome-ignore lint/correctness/useExhaustiveDependencies:
	useEffect(() => {
		const confirmEmail = async () => {
			try {
				const { message }: ConfirmEmailPOSTresponse = await (
					await fetch(apiPaths.authentication.email.confirm, {
						method: 'POST',
						credentials: 'include',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ token } satisfies ConfirmEmailPOSTbody),
					})
				).json()

				if (message === 'success') {
					setUser((prev) => (prev ? { ...prev, emailConfirmed: true } : null))
				}

				setMessage(message)
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

	return (
		<>
			{isLoading && (
				<div data-test-id={dataTestIdNames.emailConfirmation.loading} className="flex gap-x-2">
					<Spinner />
					<span>Confirming your email...</span>
				</div>
			)}

			{!isLoading && !message && (
				<div data-test-id={dataTestIdNames.emailConfirmation.default}>Please wait while we confirm your email address</div>
			)}

			{!isLoading && message && <div data-test-id={dataTestIdNames.emailConfirmation.response}>{message}</div>}
		</>
	)
}
