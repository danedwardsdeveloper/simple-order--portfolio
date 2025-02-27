'use client'
import PleaseConfirmYourEmailMessage from '@/components/PleaseConfirmYourEmailMessage'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { useUser } from '@/providers/user'
import CustomersList from './components/CustomersList'
import InviteCustomerForm from './components/InviteCustomerForm'

export default function CustomersPage() {
	const { user, showNoCustomersMessage } = useUser()

	if (!user) return <UnauthorisedLinks />

	return (
		<>
			{showNoCustomersMessage && <PleaseConfirmYourEmailMessage email={user.email} />}
			<InviteCustomerForm />
			<CustomersList />
		</>
	)
}
