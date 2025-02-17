'use client'
import Spinner from '@/components/Spinner'
import { apiPaths } from '@/library/constants'
import { dataTestIdNames } from '@/library/constants/definitions/dataTestId'
import type { ConfirmEmailPOSTbody, ConfirmEmailPOSTresponse } from '@/types/api/authentication/email/confirm'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

// The suspense wrapper is a requirement of useSearchParams
function ConfirmEmailMessage() {
	const searchParams = useSearchParams()
	const token = searchParams.get('token')
	const [isLoading, setIsLoading] = useState(true)
	const [message, setMessage] = useState<string | null>(null)

	useEffect(() => {
		const confirmEmail = async () => {
			try {
				const body: ConfirmEmailPOSTbody = { token }
				const response = await fetch(apiPaths.authentication.email.confirm, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
				})
				const data: ConfirmEmailPOSTresponse = await response.json()
				setMessage(data.message)
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

export default function Page() {
	return (
		<div>
			<h1>Confirm your email</h1>
			{/* The suspense wrapper is a requirement of useSearchParams */}
			<Suspense fallback={<Spinner />}>
				<ConfirmEmailMessage />
			</Suspense>
		</div>
	)
}
