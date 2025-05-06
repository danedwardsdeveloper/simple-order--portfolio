'use client'
import type { PortalSessionPOSTresponse } from '@/app/api/payments/create-portal-session/route'
import Spinner from '@/components/Spinner'
import { useNotifications } from '@/components/providers/notifications'
import { useUser } from '@/components/providers/user'
import { userMessages } from '@/library/constants'
import { apiRequest } from '@/library/utilities/public'
import { ArrowUpRightIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function PortalButton({ subscriptionEnd }: { subscriptionEnd: Date | undefined }) {
	const { user } = useUser()
	const { createNotification } = useNotifications()
	const [isLoading, setIsLoading] = useState(false)
	const [isRedirecting, setIsRedirecting] = useState(false)
	const router = useRouter()

	if (!subscriptionEnd || user?.subscriptionCancelled) return null

	async function handleClick() {
		if (!subscriptionEnd) return null

		try {
			setIsLoading(true)

			const { redirectUrl, userMessage } = await apiRequest<PortalSessionPOSTresponse>({
				basePath: '/payments/create-portal-session',
				method: 'POST',
			})

			if (redirectUrl) {
				setIsRedirecting(true)
				router.push(redirectUrl)
				return
			}

			if (userMessage) {
				createNotification({
					level: 'error',
					title: 'Error',
					message: userMessage,
				})
			}
		} catch {
			createNotification({
				level: 'error',
				title: 'Error',
				message: userMessages.stripeCreateCheckoutError,
			})
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="p-3 border-2 border-zinc-100 rounded-xl w-full max-w-md flex flex-col gap-y-4">
			<button
				type="button"
				data-component="PortalButton"
				onClick={handleClick}
				className="button-primary w-full h-10 flex justify-center items-center gap-x-2"
				disabled={isLoading || isRedirecting}
			>
				{(() => {
					if (isLoading) return <Spinner classes="text-white" />
					if (isRedirecting) return 'Redirecting...'
					return (
						<>
							Manage subscription
							<ArrowUpRightIcon className="inline-block size-5" />
						</>
					)
				})()}
			</button>
		</div>
	)
}
