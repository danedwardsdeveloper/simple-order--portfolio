'use client'
import { SubmitButton } from '@/components/Buttons'
import { useNotifications } from '@/components/providers/notifications'
import { dataTestIdNames, userMessages } from '@/library/constants'
import { type FormEvent, useState } from 'react'
import type { CustomersPageContent } from './Content'

type Props = Pick<CustomersPageContent, 'isDemo' | 'user' | 'setInvitationsSent' | 'inviteCustomer'>

export default function InviteCustomerForm({ isDemo, user, inviteCustomer, setInvitationsSent }: Props) {
	const { successNotification, errorNotification } = useNotifications()
	const [invitedEmail, setInvitedEmail] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	if (!user || user.roles === 'customer' || !user.emailConfirmed) return null

	/* ToDo: Display subscription/trial ended message. This should be a separate component though.
	if (!user.subscriptionEnd || !user.trialEnd) {
		return (
			<div className="max-w-md p-3 border-2 my-4 rounded-xl border-red-300 ">
				<h2 className="mb-2">Trial expired</h2>
				<p>Please subscribe to invite more customers</p>
			</div>
		)
	}
	*/

	async function handleSubmit(event: FormEvent) {
		event.preventDefault()
		setIsSubmitting(true)

		try {
			const { ok, userMessage, browserSafeInvitationRecord } = await inviteCustomer(invitedEmail)

			if (browserSafeInvitationRecord) {
				const phrase = isDemo ? 'Would have sent email to ' : 'Sent invitation email to '

				successNotification(`${phrase}${invitedEmail}`)

				setInvitationsSent((prev) => (prev ? [browserSafeInvitationRecord, ...prev] : [browserSafeInvitationRecord]))
				setInvitedEmail('')
			}

			if (!ok && userMessage) errorNotification(userMessage)
		} catch {
			errorNotification(userMessages.serverError)
		} finally {
			setIsSubmitting(false)
		}
	}

	/*
	Main ToDo:
	- First remove email obscuring
	- Use Zod & React-hook-form
	- Prevent the client from sending duplicate invitations
	- Prevent the client from inviting themselves!
	*/

	return (
		<div data-test-id={dataTestIdNames.invite.form}>
			<form onSubmit={handleSubmit} className="flex flex-col gap-y-4 max-w-md p-3 border-2 my-4 rounded-xl border-blue-300 ">
				<h2>Invite a customer</h2>
				<div className="flex flex-col mb-4">
					<label htmlFor="invitedEmail" className="mb-1">
						Email
					</label>
					<input
						data-test-id={dataTestIdNames.invite.emailInput}
						id="invitedEmail"
						type="email"
						placeholder="customer@gmail.com"
						value={invitedEmail}
						onChange={(event) => setInvitedEmail(event.target.value)}
						required
					/>
				</div>
				<SubmitButton
					dataTestId='"invite-customer-submit-button"'
					content="Send invitation"
					formReady={Boolean(invitedEmail)}
					isSubmitting={isSubmitting}
				/>
			</form>
		</div>
	)
}
