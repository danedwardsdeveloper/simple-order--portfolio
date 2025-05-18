'use client'
import type { InvitationsPOSTbody, InvitationsPOSTresponse } from '@/app/api/invitations/route'
import SubmitButton from '@/components/SubmitButton'
import { useNotifications } from '@/components/providers/notifications'
import { useUser } from '@/components/providers/user'
import { dataTestIdNames, userMessages } from '@/library/constants'
import { apiRequest } from '@/library/utilities/public'
import type { UserContextType } from '@/types'
import { type FormEvent, useState } from 'react'

// Main ToDo!
type Props = {
	setInvitationsSent: UserContextType['setInvitationsSent']
}

export default function InviteCustomerForm() {
	const { user, setInvitationsSent } = useUser()
	const { successNotification, errorNotification } = useNotifications()
	const [invitedEmail, setInvitedEmail] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Move this to the app parent, and let the demo handle itself
	if (!user || user.roles === 'customer' || !user.emailConfirmed) return null

	/* ToDo: Display subscription/trial ended message
	if (!user.subscriptionEnd || !user.trialEnd) {
		return (
			<div className="max-w-md p-3 border-2 my-4 rounded-xl border-red-300 ">
				<h2 className="mb-2">Trial expired</h2>
				<p>Please subscribe to invite more customers</p>
			</div>
		)
	}
	*/

	// ToDo: there's a weird glitch for a split second when you submit the form

	async function handleSubmit(event: FormEvent) {
		event.preventDefault()
		setIsSubmitting(true)

		try {
			const { userMessage, browserSafeInvitationRecord } = await apiRequest<InvitationsPOSTresponse, InvitationsPOSTbody>({
				body: { invitedEmail },
				basePath: '/invitations',
				method: 'POST',
			})

			if (browserSafeInvitationRecord) {
				successNotification(`Successfully sent invitation email to ${invitedEmail}`)

				setInvitationsSent((prev) => (prev ? [browserSafeInvitationRecord, ...prev] : [browserSafeInvitationRecord]))
				setInvitedEmail('')
			}

			// ToDo: Add error if user has already been invited
			if (userMessage) errorNotification(userMessage)
		} catch {
			errorNotification(userMessages.serverError)
		} finally {
			setIsSubmitting(false)
		}
	}

	// Enhancement ToDo: validate email on the client
	// Trim, check email isn't the user's own etc.

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
