import ConfirmEmailMessage from '@/components/ConfirmEmailMessage'
import CustomersList from './components/CustomersList'
import InviteCustomerForm from './components/InviteCustomerForm'

export default function CustomersPage() {
	return (
		<>
			<h2>Customers</h2>
			<ConfirmEmailMessage />
			<InviteCustomerForm />
			<CustomersList />
		</>
	)
}
