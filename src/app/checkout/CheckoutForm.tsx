'use client'
import Spinner from '@/components/Spinner'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import logger from '@/library/logger'
import { useUser } from '@/providers/user'
import { useSearchParams } from 'next/navigation'
import { type FormEvent, useState } from 'react'

export default function CheckoutPage() {
	const searchParams = useSearchParams()
	const status = searchParams.get('success')
	const { user } = useUser()
	const [isLoading, setIsLoading] = useState(false)

	if (status === 'true') return <h1>Successfully subscribed</h1>
	if (status === 'false') return <h1>Subscription cancelled</h1>

	if (!user) return <UnauthorisedLinks />

	async function handleSubmit(event: FormEvent) {
		event.preventDefault()
		setIsLoading(true)
		try {
			setIsLoading(true)
			const response = await fetch('/api/stripe/create-checkout-session', { method: 'POST' })

			if (!response.ok) logger.error('checkout/page.tsx error')
		} catch (error) {
			logger.error('app/checkout/page.tsx error: ', error)
			setIsLoading(false)
		}
	}

	return (
		<form onSubmit={handleSubmit}>
			<button type="submit" className="button-primary max-w-sm w-full h-10 flex justify-center items-center" disabled={isLoading}>
				{isLoading ? <Spinner classes="text-white" /> : 'Checkout'}
			</button>
		</form>
	)
}
