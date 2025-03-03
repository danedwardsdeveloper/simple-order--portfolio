'use client'
import type { InvitationsPOSTbody, InvitationsPOSTresponse } from '@/app/api/invitations/route'
import { apiPaths, dataTestIdNames } from '@/library/constants'
import logger from '@/library/logger'
import { useNotifications } from '@/providers/notifications'
import { useUser } from '@/providers/user'
import { type ChangeEvent, type FormEvent, useState } from 'react'

export default function InviteCustomerForm() {
	const { user, setInvitedCustomers } = useUser()
	const { createNotification } = useNotifications()
	const [loading, setLoading] = useState(false)
	const [responseMessage, setResponseMessage] = useState('')
	const [invitedEmail, setInvitedEmail] = useState('')

	if (!user || user.roles === 'customer' || !user.emailConfirmed) return null

	// ToDo: there's a weird glitch for a split second when you submit the form

	async function handleSubmit(event: FormEvent) {
		event.preventDefault()
		setResponseMessage('')
		setLoading(true)

		try {
			const { message, browserSafeInvitationRecord }: InvitationsPOSTresponse = await (
				await fetch(apiPaths.invitations.base, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ invitedEmail } satisfies InvitationsPOSTbody),
				})
			).json()

			if (message === 'success' && browserSafeInvitationRecord) {
				createNotification({
					level: 'success',
					title: 'Success',
					message: `Successfully sent invitation email to ${invitedEmail}`,
				})
				setInvitedCustomers((prev) => (prev ? [browserSafeInvitationRecord, ...prev] : []))
				setInvitedEmail('')
			} else {
				setResponseMessage(message)
			}
		} catch (error) {
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
