'use client'
import type { InvitationsPOSTbody } from '@/app/api/invitations/post'
import CustomersPageContent, { type InviteCustomerFunction } from '@/app/customers/components/Content'
import { useDemoUser } from '@/components/providers/demo/user'
import { useUi } from '@/components/providers/ui'
import { userMessages } from '@/library/constants'
import { invitationExpiryDate, obfuscateEmail, subtleDelay } from '@/library/utilities/public'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DemoCustomersPage() {
	const { merchant, invitationsSent, setInvitationsSent, confirmedCustomers } = useDemoUser()
	const { merchantMode } = useUi()
	const router = useRouter()

	useEffect(() => {
		if (!merchantMode) {
			router.push('/demo/dashboard')
		}
	}, [merchantMode, router])

	const inviteCustomer: InviteCustomerFunction = async (invitedEmail: InvitationsPOSTbody['invitedEmail']) => {
		await subtleDelay()

		const invitation = {
			obfuscatedEmail: obfuscateEmail(invitedEmail),
			lastEmailSentDate: new Date(),
			expirationDate: invitationExpiryDate(),
		}

		const forceError = false
		if (forceError) {
			return {
				ok: false,
				userMessage: userMessages.serverError,
			}
		}

		return { ok: true, invitation }
	}

	return (
		<CustomersPageContent
			user={merchant}
			isDemo={true}
			invitationsSent={invitationsSent}
			confirmedCustomers={confirmedCustomers}
			setInvitationsSent={setInvitationsSent}
			inviteCustomer={inviteCustomer}
		/>
	)
}
