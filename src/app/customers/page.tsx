import ConfirmEmailMessage from '@/components/ConfirmEmailMessage'
import InviteCustomerForm from './components/InviteCustomerForm'

// This is for merchants to handle their invited customers
export default function CustomersPage() {
	return (
		<>
			<h2>Customers</h2>
			<ConfirmEmailMessage />
			<InviteCustomerForm />
		</>
	)
}
