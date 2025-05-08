'use client'
import MessageContainer from '@/components/MessageContainer'
import PleaseConfirmYourEmailMessage from '@/components/PleaseConfirmYourEmailMessage'
import { useUser } from '@/components/providers/user'
import Link from 'next/link'

export default function WelcomeMessages() {
	const { user, inventory, confirmedCustomers, invitationsSent } = useUser()
	if (!user) return null

	const emailConfirmed = user.emailConfirmed

	const notJustACustomer = user.roles !== 'customer'

	const now = new Date()

	const trialExpired = notJustACustomer && user.trialEnd !== undefined && user.trialEnd !== null && new Date(user.trialEnd) < now

	const hasHadSubscription = notJustACustomer && user.subscriptionEnd !== undefined && user.subscriptionEnd !== null

	const subscriptionExpired = hasHadSubscription && new Date(user.subscriptionEnd as Date) < now

	const trialExpiredNoSubscription = trialExpired && !hasHadSubscription

	const hasExpiredSubscription = hasHadSubscription && subscriptionExpired

	return (
		<>
			{trialExpiredNoSubscription && (
				<MessageContainer borderColour="border-red-300">
					<h2 className="mb-2">Trial expired</h2>
					<p>Your trial period has ended. Please subscribe to continue using Simple Order.</p>
				</MessageContainer>
			)}

			{hasExpiredSubscription && (
				<MessageContainer borderColour="border-red-300">
					<h2 className="mb-2">Subscription expired</h2>
					<p>Your subscription has ended. Please renew your subscription to continue using all features.</p>
				</MessageContainer>
			)}

			{!emailConfirmed && (
				//
				<PleaseConfirmYourEmailMessage email={user.email} />
				//
			)}

			{emailConfirmed && !confirmedCustomers && !invitationsSent && (
				<MessageContainer borderColour="border-blue-300">
					<Link href="/customers" className="link-primary">
						Invite your first customer
					</Link>
				</MessageContainer>
			)}

			{!inventory && notJustACustomer && (
				<MessageContainer borderColour="border-blue-300">
					<Link href="/inventory" className="link-primary">
						Add your first product
					</Link>
				</MessageContainer>
			)}
		</>
	)
}
