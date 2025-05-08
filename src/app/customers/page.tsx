'use client'
import PleaseConfirmYourEmailMessage from '@/components/PleaseConfirmYourEmailMessage'
import TwoColumnContainer from '@/components/TwoColumnContainer'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { useUser } from '@/components/providers/user'
import CustomersList from './components/CustomersList'
import InviteCustomerForm from './components/InviteCustomerForm'

export default function CustomersPage() {
	const { user } = useUser()

	if (!user) return <UnauthorisedLinks />

	return (
		<>
			<TwoColumnContainer
				mainColumn={!user.emailConfirmed ? <PleaseConfirmYourEmailMessage email={user.email} /> : <CustomersList />}
				sideColumn={<InviteCustomerForm />}
			/>
		</>
	)
}
