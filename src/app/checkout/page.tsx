'use client'
import Spinner from '@/components/Spinner'
import { Suspense } from 'react'
import CheckoutForm from './CheckoutForm'

export default function CheckoutPage() {
	return (
		<>
			<h1>Checkout</h1>
			<Suspense fallback={<Spinner />}>
				<CheckoutForm />
			</Suspense>
		</>
	)
}
