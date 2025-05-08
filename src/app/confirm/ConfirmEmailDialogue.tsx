'use client'
import Spinner from '@/components/Spinner'
import { useNotifications } from '@/components/providers/notifications'
import { useUser } from '@/components/providers/user'
import { dataTestIdNames, userMessages } from '@/library/constants'
import { searchParamNames } from '@/library/constants/definitions/searchParams'
import { apiRequest } from '@/library/utilities/public'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { ConfirmEmailPOSTbody, ConfirmEmailPOSTresponse } from '../api/authentication/email/confirm/route'

export default function ConfirmEmailDialogue() {
	const searchParams = useSearchParams()
	const token = searchParams.get(searchParamNames.emailConfirmationToken)
	const hasCheckedToken = useRef(false)
	const { setUser } = useUser()
	const { createNotification } = useNotifications()
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(true)
	const [message, setMessage] = useState<string | null>(null)

	// biome-ignore lint/correctness/useExhaustiveDependencies:
	useEffect(() => {
		async function confirmEmail() {
			if (!token || hasCheckedToken.current) return

			hasCheckedToken.current = true

			try {
				const { confirmedUser, userMessage } = await apiRequest<ConfirmEmailPOSTresponse, ConfirmEmailPOSTbody>({
					basePath: '/authentication/email/confirm',
					method: 'POST',
					body: { token },
				})

				if (confirmedUser) {
					setUser(confirmedUser)
					createNotification({
						level: 'success',
						title: 'Success',
						message: 'Thank you for confirming your email',
					})
					router.push('/dashboard')
				}

				if (userMessage === userMessages.emailAlreadyConfirmed) {
					createNotification({
						level: 'info',
						title: 'Already confirmed',
						message: 'Your email address was already confirmed',
					})
					router.push('/dashboard')
				}

				if (userMessage === userMessages.serverError) {
					setMessage(userMessage)
				}
			} catch {
				setMessage(userMessages.serverError)
			} finally {
				setIsLoading(false)
			}
		}

		confirmEmail()
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
