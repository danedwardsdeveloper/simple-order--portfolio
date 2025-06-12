'use client'
import Spinner from '@/components/Spinner'
import { useNotifications } from '@/components/providers/notifications'
import { updateUserData, useUser } from '@/components/providers/user'
import { dataTestIdNames, userMessages } from '@/library/constants'
import { searchParamNames } from '@/library/constants/definitions/searchParams'
import { apiRequest, validateUuid } from '@/library/utilities/public'
import { nextRouteConfig } from '@/types'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { ConfirmEmailPOSTbody, ConfirmEmailPOSTresponse } from '../api/authentication/email/confirm/route'

export const { dynamic } = nextRouteConfig({
	dynamic: 'force-dynamic',
})

export default function ConfirmEmailPage() {
	const searchParams = useSearchParams()
	const token = searchParams.get(searchParamNames.emailConfirmationToken)
	const hasCheckedToken = useRef(false)
	const {
		setUser,
		setInventory,
		setConfirmedCustomers,
		setConfirmedMerchants,
		setInvitationsReceived,
		setInvitationsSent,
		setOrdersMade,
		setOrdersReceived,
	} = useUser()
	const { createNotification, successNotification } = useNotifications()
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(true)
	const [message, setMessage] = useState<string | null>(null)

	// biome-ignore lint/correctness/useExhaustiveDependencies:
	useEffect(() => {
		async function confirmEmail() {
			if (!token || hasCheckedToken.current) {
				setIsLoading(false)
				return
			}

			hasCheckedToken.current = true

			if (!validateUuid(token)) {
				setIsLoading(false)
				setMessage('Token not valid!')
				return
			}

			try {
				const { ok, userData, userMessage } = await apiRequest<ConfirmEmailPOSTresponse, ConfirmEmailPOSTbody>({
					basePath: '/authentication/email/confirm',
					method: 'POST',
					body: { token },
				})

				if (ok) {
					updateUserData(userData, {
						setUser,
						setInventory,
						setConfirmedCustomers,
						setConfirmedMerchants,
						setInvitationsReceived,
						setInvitationsSent,
						setOrdersMade,
						setOrdersReceived,
					})

					successNotification('Thank you for confirming your email')
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
				<div
					data-test-id={dataTestIdNames.emailConfirmation.loading} //
					className="flex gap-x-2"
				>
					<Spinner />
					<span>Confirming your email...</span>
				</div>
			)}

			{!isLoading && message && (
				<div
					data-test-id={dataTestIdNames.emailConfirmation.response} //
				>
					<h1>{message}</h1>
				</div>
			)}
		</>
	)
}
