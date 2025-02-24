'use client'
import type { InviteCustomerPOSTbody, InviteCustomerPOSTresponse } from '@/app/api/invitations/create/route'
import { apiPaths, dataTestIdNames } from '@/library/constants'
import logger from '@/library/logger'
import { useUser } from '@/providers/user'
import { type ChangeEvent, type FormEvent, useState } from 'react'

export default function InviteCustomerForm() {
	const { user } = useUser()
	const [loading, setLoading] = useState(false)
	const [responseMessage, setResponseMessage] = useState('')
	const [invitedEmail, setInvitedEmail] = useState('')

	// ToDo: Only show this message to merchants
	if (!user || !user.emailConfirmed) return null

	async function handleSubmit(event: FormEvent) {
		event.preventDefault()
		setResponseMessage('')
		setLoading(true)

		try {
			const body: InviteCustomerPOSTbody = {
				invitedEmail,
			}

			const response = await fetch(apiPaths.invitations.create, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			})
			const { message, browserSafeInvitationRecord }: InviteCustomerPOSTresponse = await response.json()

			logger.debug('Browser-safe invitation record: ', JSON.stringify(browserSafeInvitationRecord))

			// Figure out how to add the invitation record to the state...
			// if(browserSafeInvitationRecord) {
			//   setuser({
			//     ...user,
			//     pendingCustomersAsMerchant: [browserSafeInvitationRecord],
			//   })
			// }
			setInvitedEmail('')
			setResponseMessage(message)
		} catch (error) {
			logger.error('Error sending new invitation fetch request', error)
			setResponseMessage('Unknown error')
		} finally {
			setLoading(false)
		}
	}

	function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
		setInvitedEmail(event.target.value)
	}

	function ResponseMessage() {
		if (loading) {
			return <p data-test-id={dataTestIdNames.invite.loading}>Sending invitation...</p>
		}
		return responseMessage && <p data-test-id={dataTestIdNames.invite.response}>{responseMessage}</p>
	}

	return (
		<div data-test-id={dataTestIdNames.invite.form}>
			<form onSubmit={handleSubmit} className="flex flex-col gap-y-4 max-w-sm p-3 border-2 my-4 rounded-xl border-blue-300 ">
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
