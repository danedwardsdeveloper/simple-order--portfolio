'use client'

import ConfirmEmailMessage from '../../components/ConfirmEmailMessage'
import EmptyInventoryMessage from './components/EmptyInventoryLink'

// import { useUi } from '@/providers/ui'
import { useUser } from '@/providers/user'

export default function DashboardPage() {
	const { user } = useUser()
	// const { merchantMode } = useUi()

	if (!user) {
		return null
	}

	// const emailConfirmed = user.emailConfirmed
	// const hasConfirmedCustomers =
	// 	Array.isArray(user.merchantDetails?.customersAsMerchant) && user.merchantDetails?.customersAsMerchant.length > 0

	// function NoCustomersMessage() {
	// 	if (hasConfirmedCustomers) return null
	// 	if (emailConfirmed) {
	// 		return (
	// 			<div className="max-w-prose p-3 my-4 border-2 rounded-xl border-blue-300">
	// 				<Link href="/customers" className="link-primary">
	// 					Invite your first customer
	// 				</Link>
	// 			</div>
	// 		)
	// 	}
	// 	return (
	// 		<p className="max-w-prose p-3 my-4 border-2 rounded-xl border-orange-300">
	// 			{'You must confirm your email before inviting your first customer'}
	// 		</p>
	// 	)
	// }

	return (
		<>
			<h1>Dashboard</h1>
			{user && <p>{`Welcome ${user.businessName}`}</p>}
			<ConfirmEmailMessage />
			<EmptyInventoryMessage />
			{/* {merchantMode && <NoCustomersMessage />} */}
		</>
	)
}
