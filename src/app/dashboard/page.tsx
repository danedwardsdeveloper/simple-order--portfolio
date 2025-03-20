'use client'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import Spinner from '@/components/Spinner'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { useUser } from '@/providers/user'
import WelcomeMessages from './components/WelcomeMessages'

export default function DashboardPage() {
	const { user, isLoading, ordersMade, ordersReceived } = useUser()

	if (!user) return <UnauthorisedLinks />

	if (isLoading) return <Spinner />

	return (
		<>
			<SignedInBreadCrumbs businessName={user.businessName} />
			<h1>Dashboard</h1>
			<WelcomeMessages />

			{/* Temporary data display */}
			{ordersMade && (
				<div className="whitespace-pre-wrap break-all">
					<h2 className="mt-8 mb-2">Orders made</h2>
					<p>{JSON.stringify(ordersMade)}</p>
				</div>
			)}

			{/* Temporary data display */}
			{ordersReceived && (
				<div className="whitespace-pre-wrap break-all">
					<h2 className="mt-8 mb-2">Orders received</h2>
					<p>{JSON.stringify(ordersReceived)}</p>
				</div>
			)}
		</>
	)
}
