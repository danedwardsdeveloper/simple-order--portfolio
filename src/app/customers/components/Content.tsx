import type { InvitationsPOSTbody } from '@/app/api/invitations/route'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import PleaseConfirmYourEmailMessage from '@/components/PleaseConfirmYourEmailMessage'
import TwoColumnContainer from '@/components/TwoColumnContainer'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import type { BrowserSafeInvitationSent, DiscriminatedUnion, UserContextType, UserMessages } from '@/types'
import CustomersList from './CustomersList'
import InviteCustomerForm from './InviteCustomerForm'

export type InviteCustomerFunction = (
	invitedEmail: InvitationsPOSTbody['invitedEmail'],
) => Promise<DiscriminatedUnion<{ invitation: BrowserSafeInvitationSent }, { userMessage: UserMessages }>>

export type CustomersPageContent = {
	isSubmitting: boolean
	inviteCustomer: InviteCustomerFunction
	demoMode: boolean
} & Pick<UserContextType, 'user' | 'invitationsSent' | 'setInvitationsSent' | 'confirmedCustomers'>

export default function CustomersPageContent({
	user,
	demoMode,
	invitationsSent,
	setInvitationsSent,
	confirmedCustomers,
	inviteCustomer,
	isSubmitting,
}: CustomersPageContent) {
	if (!user) return <UnauthorisedLinks />

	return (
		<>
			<SignedInBreadCrumbs businessName={user.businessName} currentPageTitle="Customers" demoMode={demoMode} />

			<TwoColumnContainer
				mainColumn={(() => {
					if (!user.emailConfirmed) {
						return <PleaseConfirmYourEmailMessage email={user.email} />
					}

					return <CustomersList invitationsSent={invitationsSent} confirmedCustomers={confirmedCustomers} />
				})()}
				sideColumn={
					<InviteCustomerForm
						user={user}
						demoMode={demoMode}
						setInvitationsSent={setInvitationsSent}
						isSubmitting={isSubmitting}
						inviteCustomer={inviteCustomer}
					/>
				}
			/>
		</>
	)
}
