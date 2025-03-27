import type { ReactNode } from 'react'
import SubscribeButton from './SubscribeButton'

export default function TrialExpiryInformation({ expiry }: { expiry?: Date }) {
	if (!expiry) return null

	const currentDate = new Date()

	const timeDifference = new Date(expiry).getTime() - currentDate.getTime()

	const dayDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24))

	function Container({ children }: { children: ReactNode }) {
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
			<Container>
				<span>Your free trial has expired</span>
			</Container>
		)
	}

	// Less than one day remaining
	if (dayDifference === 0) {
		if (timeDifference > 0) {
			return (
				<Container>
					<span>Your free trial expires today</span>
				</Container>
			)
		}
	}

	return (
		<Container>
			<span>
				You have{' '}
				<strong>
					{dayDifference} {dayDifference === 1 ? 'day' : 'days'}
				</strong>{' '}
				remaining on your free trial.
			</span>
		</Container>
	)
}
