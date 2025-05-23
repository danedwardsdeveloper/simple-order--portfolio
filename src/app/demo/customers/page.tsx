'use client'
import type { InvitationsPOSTbody } from '@/app/api/invitations/route'
import CustomersPageContent, { type InviteCustomerFunction } from '@/app/customers/components/Content'
import { useDemoUser } from '@/components/providers/demo/user'
import { useUi } from '@/components/providers/ui'
import { userMessages } from '@/library/constants'
import { invitationExpiryDate, obfuscateEmail, subtleDelay } from '@/library/utilities/public'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DemoCustomersPage() {
	const { demoUser, invitationsSent, setInvitationsSent, confirmedCustomers } = useDemoUser()
	const { merchantMode } = useUi()

	const [isSubmitting, setIsSubmitting] = useState(false)

	const router = useRouter()

	useEffect(() => {
		if (!merchantMode) {
			router.push('/demo/dashboard')
		}
	}, [merchantMode, router])

	const inviteCustomer: InviteCustomerFunction = async (invitedEmail: InvitationsPOSTbody['invitedEmail']) => {
		setIsSubmitting(true)
		await subtleDelay()

		const invitation = {
			obfuscatedEmail: obfuscateEmail(invitedEmail),
			lastEmailSentDate: new Date(),
			expirationDate: invitationExpiryDate(),
		}

		const forceError = false

		setIsSubmitting(false)

		return forceError ? { userMessage: userMessages.serverError } : { invitation: invitation }
	}

	return (
		<CustomersPageContent
			user={demoUser}
			demoMode={true}
			invitationsSent={invitationsSent}
			confirmedCustomers={confirmedCustomers}
			setInvitationsSent={setInvitationsSent}
			inviteCustomer={inviteCustomer}
			isSubmitting={isSubmitting}
		/>
	)
}
