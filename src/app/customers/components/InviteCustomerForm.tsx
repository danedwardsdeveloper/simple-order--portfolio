'use client'
import type { InvitationsPOSTbody, InvitationsPOSTresponse } from '@/app/api/invitations/route'
import { useNotifications } from '@/components/providers/notifications'
import { useUser } from '@/components/providers/user'
import { dataTestIdNames } from '@/library/constants'
import logger from '@/library/logger'
import { apiRequest } from '@/library/utilities/public'
import { type ChangeEvent, type FormEvent, useState } from 'react'

export default function InviteCustomerForm() {
	const { user, setInvitationsSent } = useUser()
	const { createNotification } = useNotifications()
	const [loading, setLoading] = useState(false)
	const [responseMessage, setResponseMessage] = useState('')
	const [invitedEmail, setInvitedEmail] = useState('')

	if (!user || user.roles === 'customer' || !user.emailConfirmed) return null

	if (!user.subscriptionEnd || !user.trialEnd) {
		return (
			<div className="max-w-md p-3 border-2 my-4 rounded-xl border-red-300 ">
				<h2 className="mb-2">Trial expired</h2>
				<p>Please subscribe to invite more customers</p>
			</div>
		)
	}

	// ToDo: there's a weird glitch for a split second when you submit the form

	async function handleSubmit(event: FormEvent) {
		event.preventDefault()
		setResponseMessage('')
		setLoading(true)

		try {
			const { userMessage, browserSafeInvitationRecord } = await apiRequest<InvitationsPOSTresponse, InvitationsPOSTbody>({
				body: { invitedEmail },
				basePath: '/invitations',
				method: 'POST',
			})

			if (browserSafeInvitationRecord) {
				createNotification({
					level: 'success',
					title: 'Success',
					message: `Successfully sent invitation email to ${invitedEmail}`,
				})
				// ToDo: check this logic and use Immer
				setInvitationsSent((prev) => (prev ? [browserSafeInvitationRecord, ...prev] : []))
				setInvitedEmail('')
			}

			if (userMessage) setResponseMessage(userMessage)
		} catch (error) {
			// ToDo: Don't use caught errors
			logger.error('Error sending new invitation fetch request', error)
			setResponseMessage('Unknown error')
		} finally {
			setLoading(false)
		}
	}

	// Enhancement ToDo: validate email on the client
	// Trim, check email isn't the user's own etc.

	function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
		setInvitedEmail(event.target.value)
	}

	function ResponseMessage() {
		if (loading) {
			return <p data-test-id={dataTestIdNames.invite.loading}>Sending invitation...</p>
		}
		return (
			responseMessage && (
				<p data-test-id={dataTestIdNames.invite.response} className="text-red-600">
					{responseMessage}
				</p>
			)
		)
	}

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
						onChange={handleEmailChange}
						required
					/>
				</div>
				<button
					data-test-id={dataTestIdNames.invite.submitButton}
					type="submit"
					disabled={loading || !invitedEmail}
					className="button-primary"
				>
					Send invitation
				</button>
				<ResponseMessage />
			</form>
		</div>
	)
}
