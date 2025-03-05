'use client'
import Spinner from '@/components/Spinner'
import { Suspense } from 'react'
import ConfirmEmailResponse from './ConfirmEmailResponse'

export default function ConfirmEmailPage() {
	return (
		<>
			<Suspense fallback={<Spinner />}>
				<ConfirmEmailResponse />
			</Suspense>
		</>
	)
}
