'use client'
import Spinner from '@/components/Spinner'
import { apiPaths, dataTestIdNames } from '@/library/constants'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { ConfirmEmailPOSTbody, ConfirmEmailPOSTresponse } from '../api/authentication/email/confirm/route'

export default function ConfirmEmailResponse() {
	const searchParams = useSearchParams()
	const token = searchParams.get('token')
	const [isLoading, setIsLoading] = useState(true)
	const [message, setMessage] = useState<string | null>(null)

	useEffect(() => {
		const confirmEmail = async () => {
			try {
				const { message }: ConfirmEmailPOSTresponse = await (
					await fetch(apiPaths.authentication.email.confirm, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ token } satisfies ConfirmEmailPOSTbody),
					})
				).json()

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
