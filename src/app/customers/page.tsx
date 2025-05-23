'use client'
import { useUser } from '@/components/providers/user'
import { userMessages } from '@/library/constants'
import { apiRequest, developmentDelay } from '@/library/utilities/public'
import { useState } from 'react'
import type { InvitationsPOSTbody, InvitationsPOSTresponse } from '../api/invitations/route'
import CustomersPageContent, { type InviteCustomerFunction } from './components/Content'

export default function CustomersPage() {
	const { user, invitationsSent, setInvitationsSent, confirmedCustomers } = useUser()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const inviteCustomer: InviteCustomerFunction = async (invitedEmail: InvitationsPOSTbody['invitedEmail']) => {
		setIsSubmitting(true)
		await developmentDelay()

		const { userMessage, browserSafeInvitationRecord } = await apiRequest<InvitationsPOSTresponse, InvitationsPOSTbody>({
			body: { invitedEmail },
			basePath: '/invitations',
			method: 'POST',
		})

		if (browserSafeInvitationRecord) {
			setInvitationsSent(invitationsSent ? [browserSafeInvitationRecord, ...invitationsSent] : [browserSafeInvitationRecord])
		}

		setIsSubmitting(false)

		return browserSafeInvitationRecord
			? { invitation: browserSafeInvitationRecord }
			: { userMessage: userMessage || userMessages.serverError }
	}

	return (
		<CustomersPageContent
			user={user}
			demoMode={false}
			invitationsSent={invitationsSent}
			confirmedCustomers={confirmedCustomers}
			setInvitationsSent={setInvitationsSent}
			inviteCustomer={inviteCustomer}
			isSubmitting={isSubmitting}
		/>
	)
}
