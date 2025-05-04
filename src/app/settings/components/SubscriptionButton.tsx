'use client'
import type { CheckoutSessionPOSTresponse } from '@/app/api/payments/create-checkout-session/route'
import Spinner from '@/components/Spinner'
import { userMessages } from '@/library/constants'
import { apiRequest } from '@/library/utilities/public'
import { useNotifications } from '@/providers/notifications'
import { ArrowUpRightIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SubscribeButton() {
	const { createNotification } = useNotifications()
	const [isLoading, setIsLoading] = useState(false)
	const [isRedirecting, setIsRedirecting] = useState(false)
	const router = useRouter()

	async function handleClick() {
		try {
			setIsLoading(true)

			const { redirectUrl, userMessage } = await apiRequest<CheckoutSessionPOSTresponse>({
				basePath: '/payments/create-checkout-session',
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
		<button
			type="button"
			data-component="SubscribeButton"
			onClick={handleClick}
			className="button-primary w-full h-10 flex justify-center items-center gap-x-2"
			disabled={isLoading || isRedirecting}
		>
			{(() => {
				if (isLoading) return <Spinner classes="text-white" />
				if (isRedirecting) return 'Redirecting...'
				return (
					<>
						Subscribe now
						<ArrowUpRightIcon className="inline-block size-5" />
					</>
				)
			})()}
		</button>
	)
}
