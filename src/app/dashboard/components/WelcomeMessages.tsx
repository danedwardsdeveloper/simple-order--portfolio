'use client'
import MessageContainer from '@/components/MessageContainer'
import PleaseConfirmYourEmailMessage from '@/components/PleaseConfirmYourEmailMessage'
import { capitaliseFirstLetter } from '@/library/utilities/public'
import { useUser } from '@/providers/user'
import Link from 'next/link'

export default function WelcomeMessages() {
	const { user, inventory, confirmedCustomers, invitationsSent } = useUser()
	if (!user) return null

	const messageTypes = {
		roleNotice: 'role notice',
		pleaseConfirmYourEmail: 'please confirm your email',
		emptyInventory: 'empty inventory',
		sendFirstInvitation: 'send first invitation',
		confirmBeforeSendingFirstInvitation: 'confirm before sending first invitation',
	}

	const notJustACustomer = user.roles !== 'customer'
	const emailConfirmed = user.emailConfirmed
	const noInvitedOrConfirmedCustomers = !confirmedCustomers && !invitationsSent

	const showMessage = {
		[messageTypes.roleNotice]: true,
		[messageTypes.pleaseConfirmYourEmail]: !emailConfirmed,
		[messageTypes.emptyInventory]: notJustACustomer && !inventory,
		[messageTypes.sendFirstInvitation]: notJustACustomer && emailConfirmed && noInvitedOrConfirmedCustomers,
		[messageTypes.confirmBeforeSendingFirstInvitation]: notJustACustomer && !emailConfirmed && noInvitedOrConfirmedCustomers,
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

	function SendFirstInvitation() {
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
						{capitaliseFirstLetter(user.roles)}
					</p>
				</MessageContainer>
			)}

			{showMessage[messageTypes.pleaseConfirmYourEmail] && <PleaseConfirmYourEmailMessage email={user.email} />}

			{showMessage[messageTypes.confirmBeforeSendingFirstInvitation] && <ConfirmBeforeInviting />}

			{showMessage[messageTypes.sendFirstInvitation] && <SendFirstInvitation />}

			{showMessage[messageTypes.emptyInventory] && <EmptyInventoryMessage />}
		</>
	)
}
