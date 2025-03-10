'use client'
import MessageContainer from '@/components/MessageContainer'
import PleaseConfirmYourEmailMessage from '@/components/PleaseConfirmYourEmailMessage'
import { useUser } from '@/providers/user'
import Link from 'next/link'

export default function WelcomeMessages() {
	const { user, inventory, confirmedCustomers } = useUser()
	if (!user) return null

	const messageTypes = {
		roleNotice: 'role notice',
		emailConfirmation: 'email confirmation',
		emptyInventory: 'empty inventory',
		noCustomers: 'no customers',
	}

	function formatRole(role: string) {
		return `${role.charAt(0).toUpperCase()}${role.slice(1)}`
	}

	const displayAllForTesting = true

	const showMessage = {
		[messageTypes.roleNotice]: displayAllForTesting || true,
		[messageTypes.emailConfirmation]: displayAllForTesting || !user.emailConfirmed,
		[messageTypes.emptyInventory]: displayAllForTesting || (user.roles !== 'customer' && !inventory),
		[messageTypes.noCustomers]: displayAllForTesting || (user.roles !== 'customer' && !confirmedCustomers),
	}

	function EmptyInventoryMessage() {
		return (
			<MessageContainer borderColour="border-blue-300">
				<Link href="/inventory" className="link-primary">
					Add your first product
				</Link>
			</MessageContainer>
		)
	}

	function NoCustomersMessage() {
		return (
			<MessageContainer borderColour="border-blue-300">
				<Link href="/customers" className="link-primary">
					Invite your first customer
				</Link>
			</MessageContainer>
		)
	}

	function ConfirmBeforeInviting() {
		return (
			<MessageContainer borderColour="border-orange-300">
				<p>{'You must confirm your email before inviting your first customer'}</p>
			</MessageContainer>
		)
	}

	return (
		<>
			{showMessage[messageTypes.roleNotice] && (
				<MessageContainer borderColour="border-emerald-300">
					<p>
						<span className="text-zinc-600">Temporary role notice: </span>
						{formatRole(user.roles)}
					</p>
				</MessageContainer>
			)}

			{showMessage[messageTypes.emailConfirmation] && <PleaseConfirmYourEmailMessage email={user.email} />}

			{showMessage[messageTypes.noCustomers] && <ConfirmBeforeInviting />}

			{showMessage[messageTypes.noCustomers] && <NoCustomersMessage />}

			{showMessage[messageTypes.emptyInventory] && <EmptyInventoryMessage />}
		</>
	)
}
