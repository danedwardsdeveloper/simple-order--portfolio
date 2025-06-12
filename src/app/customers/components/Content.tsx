import type { InvitationsPOSTbody, InvitationsPOSTresponse } from '@/app/api/invitations/post'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import PleaseConfirmYourEmailMessage from '@/components/PleaseConfirmYourEmailMessage'
import TwoColumnContainer from '@/components/TwoColumnContainer'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import type { UserContextType } from '@/types'
import CustomersList from './CustomersList'
import InviteCustomerForm from './InviteCustomerForm'

// ToDo: Recycle the types from the API
export type InviteCustomerFunction = (invitedEmail: InvitationsPOSTbody['invitedEmail']) => Promise<InvitationsPOSTresponse>

export type CustomersPageContent = {
	inviteCustomer: InviteCustomerFunction
	isDemo: boolean
} & Pick<UserContextType, 'user' | 'invitationsSent' | 'setInvitationsSent' | 'confirmedCustomers'>

export default function CustomersPageContent({
	user,
	isDemo,
	invitationsSent,
	setInvitationsSent,
	confirmedCustomers,
	inviteCustomer,
}: CustomersPageContent) {
	if (!user) return <UnauthorisedLinks />

	return (
		<>
			<SignedInBreadCrumbs businessName={user.businessName} currentPageTitle="Customers" isDemo={isDemo} />

			<TwoColumnContainer
				mainColumn={(() => {
					if (!user.emailConfirmed) {
						return <PleaseConfirmYourEmailMessage email={user.email} />
					}

					return <CustomersList invitationsSent={invitationsSent} confirmedCustomers={confirmedCustomers} />
				})()}
				sideColumn={
					<InviteCustomerForm
						user={user} //
						isDemo={isDemo}
						setInvitationsSent={setInvitationsSent}
						inviteCustomer={inviteCustomer}
					/>
				}
			/>
		</>
	)
}
