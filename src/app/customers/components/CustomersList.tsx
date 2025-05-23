import { pluralise } from '@/library/utilities/public'
import type { UserContextType } from '@/types'
import ConfirmedCustomerCard from './ConfirmedCustomerCard'
import PendingInvitationCard from './PendingInvitationCard'

export type CustomersListProps = {
	confirmedCustomers: UserContextType['confirmedCustomers']
	invitationsSent: UserContextType['invitationsSent']
}

export default function CustomersList({ confirmedCustomers, invitationsSent }: CustomersListProps) {
	return (
		<div className="flex flex-col gap-y-12">
			<div className="flex flex-col gap-y-4">
				{confirmedCustomers && (
					<h2 className="">
						{confirmedCustomers.length} {pluralise('Confirmed customer', confirmedCustomers)}
					</h2>
				)}
				{confirmedCustomers?.map((customer, index) => (
					<ConfirmedCustomerCard key={customer.businessName} confirmedCustomer={customer} zebraStripe={Boolean(index % 2)} />
				))}
			</div>
			<div className="flex flex-col gap-y-4">
				{invitationsSent && (
					<h2 className="">
						{invitationsSent.length} {pluralise('Invited customer', invitationsSent)}
					</h2>
				)}
				{invitationsSent?.map((customer, index) => (
					<PendingInvitationCard key={customer.obfuscatedEmail} invitedCustomer={customer} zebraStripe={Boolean(index % 2)} />
				))}
			</div>
		</div>
	)
}
