'use client'
import { useUser } from '@/components/providers/user'
import type { ReactNode } from 'react'
import SubscribeButton from './SubscriptionButton'

export default function TrialExpiryInformation() {
	const { user } = useUser()
	// ToDo: What to render when subscription is cancelled but has time remaining

	if (!user) return null

	// They have an active subscription - show nothing
	if (user.subscriptionEnd && !user.subscriptionCancelled) return null

	const currentDate = new Date()
	currentDate.setUTCHours(0, 0, 0, 0)

	const timeDifference = user.trialEnd ? new Date(user.trialEnd).getTime() - currentDate.getTime() : 0
	const dayDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24))

	function ContainerWithSubscribeButton({ children }: { children: ReactNode }) {
		return (
			<div className="p-3 border-2 border-zinc-100 rounded-xl w-full max-w-md flex flex-col gap-y-4">
				{children}
				<SubscribeButton />
			</div>
		)
	}

	// Expired
	if (dayDifference < 0) {
		return (
			<ContainerWithSubscribeButton>
				<span>Your free trial has expired</span>
			</ContainerWithSubscribeButton>
		)
	}

	// Less than one day remaining
	// ToDo: add the time
	if (dayDifference === 0) {
		if (timeDifference > 0) {
			return (
				<ContainerWithSubscribeButton>
					<span>Your free trial expires today</span>
				</ContainerWithSubscribeButton>
			)
		}
	}

	return (
		<ContainerWithSubscribeButton>
			<span>
				You have{' '}
				<strong>
					{dayDifference} {dayDifference === 1 ? 'day' : 'days'}
				</strong>{' '}
				remaining on your free trial.
			</span>
		</ContainerWithSubscribeButton>
	)
}
