'use client'
import type { CheckoutSessionPOSTbody, CheckoutSessionPOSTresponse } from '@/app/api/payments/create-checkout-session/route'
import Spinner from '@/components/Spinner'
import { apiPaths, userMessages } from '@/library/constants'
import { useNotifications } from '@/providers/notifications'
import { useUser } from '@/providers/user'
import { ArrowUpRightIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SubscribeButton() {
	const { user } = useUser()
	const { createNotification } = useNotifications()
	const [isLoading, setIsLoading] = useState(false)
	const [isRedirecting, setIsRedirecting] = useState(false)
	const router = useRouter()

	if (!user) return null

	async function handleClick() {
		if (!user) return null

		try {
			setIsLoading(true)
			const { redirectUrl, userMessage }: CheckoutSessionPOSTresponse = await (
				await fetch(apiPaths.payments.createCheckoutSession, {
					method: 'POST',
					body: JSON.stringify({
						email: user.email,
					} satisfies CheckoutSessionPOSTbody),
				})
			).json()

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
