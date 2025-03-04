'use client'
import PleaseConfirmYourEmailMessage from '@/components/PleaseConfirmYourEmailMessage'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { useUser } from '@/providers/user'
import CustomersList from './components/CustomersList'
import InviteCustomerForm from './components/InviteCustomerForm'

export default function CustomersPage() {
	const { user } = useUser()

	if (!user) return <UnauthorisedLinks />

	return (
		<>
			{<PleaseConfirmYourEmailMessage email={user.email} />}
			<InviteCustomerForm />
			<CustomersList />
		</>
	)
}
