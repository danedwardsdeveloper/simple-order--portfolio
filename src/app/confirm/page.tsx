'use client'
import Spinner from '@/components/Spinner'
import { Suspense } from 'react'
import ConfirmEmailDialogue from './ConfirmEmailDialogue'

export default function ConfirmEmailPage() {
	return (
		<>
			<Suspense fallback={<Spinner />}>
				<ConfirmEmailDialogue />
			</Suspense>
		</>
	)
}
