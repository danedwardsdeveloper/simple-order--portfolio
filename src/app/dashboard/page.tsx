'use client'

import Link from 'next/link'

import ConfirmEmailMessage from '../../components/ConfirmEmailMessage'
import EmptyInventoryMessage from './components/EmptyInventoryLink'

import { useAuthorisation } from '@/providers/authorisation'
import { useUi } from '@/providers/ui'

export default function DashboardPage() {
	const { browserSafeUser } = useAuthorisation()
	const { merchantMode } = useUi()

	if (!browserSafeUser) {
		return null
	}

	const emailConfirmed = browserSafeUser.emailConfirmed
	const hasConfirmedCustomers =
		Array.isArray(browserSafeUser.merchantDetails?.customersAsMerchant) && browserSafeUser.merchantDetails?.customersAsMerchant.length > 0

	function NoCustomersMessage() {
		if (hasConfirmedCustomers) return null
		if (emailConfirmed) {
			return (
				<div className="max-w-prose p-3 my-4 border-2 rounded-xl border-blue-300">
					<Link href="/customers" className="link-primary">
						Invite your first customer
					</Link>
				</div>
			)
		}
		return (
			<p className="max-w-prose p-3 my-4 border-2 rounded-xl border-orange-300">
				{'You must confirm your email before inviting your first customer'}
			</p>
		)
	}

	return (
		<>
			<h1>Dashboard</h1>
			{browserSafeUser && <p>{`Welcome ${browserSafeUser.businessName}`}</p>}
			<ConfirmEmailMessage />
			<EmptyInventoryMessage />
			{merchantMode && <NoCustomersMessage />}
		</>
	)
}
