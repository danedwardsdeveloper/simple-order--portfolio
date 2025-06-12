'use client'
import { useUser } from '@/components/providers/user'
import { userMessages } from '@/library/constants'
import { apiRequest, developmentDelay } from '@/library/utilities/public'
import type { InvitationsPOSTbody, InvitationsPOSTresponse } from '../api/invitations/post'
import CustomersPageContent, { type InviteCustomerFunction } from './components/Content'

export default function CustomersPage() {
	const { user, invitationsSent, setInvitationsSent, confirmedCustomers } = useUser()

	const inviteCustomer: InviteCustomerFunction = async (invitedEmail: InvitationsPOSTbody['invitedEmail']) => {
		await developmentDelay()

		const { ok, userMessage, browserSafeInvitationRecord } = await apiRequest<InvitationsPOSTresponse, InvitationsPOSTbody>({
			body: { invitedEmail },
			basePath: '/invitations',
			method: 'POST',
		})

		if (browserSafeInvitationRecord) {
			setInvitationsSent(invitationsSent ? [browserSafeInvitationRecord, ...invitationsSent] : [browserSafeInvitationRecord])
			return { ok, invitation: browserSafeInvitationRecord }
		}

		return { ok: false, userMessage: userMessage || userMessages.serverError }
	}

	return (
		<CustomersPageContent
			user={user}
			isDemo={false}
			invitationsSent={invitationsSent}
			confirmedCustomers={confirmedCustomers}
			setInvitationsSent={setInvitationsSent}
			inviteCustomer={inviteCustomer}
		/>
	)
}
