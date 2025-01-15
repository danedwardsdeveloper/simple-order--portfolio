import { CustomerGridItem } from './components/Customer'
import CustomerList from './components/CustomerList'
import InviteCustomerButton from './components/InviteCustomerButton'

// cspell:disable
const customers: CustomerGridItem[] = [
  {
    name: `Betty's shop`,
    email: 'betty@gmail.com',
  },
  {
    name: 'Londis',
    email: 'betty@gmail.com',
  },
  {
    name: 'Bettys shop',
    email: 'betty@gmail.com',
  },
  {
    name: 'Bettys shop',
    email: 'betty@gmail.com',
  },
  {
    name: 'Bettys shop',
    email: 'betty@gmail.com',
  },
]

export default function CustomersPage() {
  return (
    <>
      <h1 className="text-xl font-bold mt-4 mb-8">Customers</h1>
      <InviteCustomerButton classes="mb-8" />
      <CustomerList customers={customers} />
    </>
  )
}
