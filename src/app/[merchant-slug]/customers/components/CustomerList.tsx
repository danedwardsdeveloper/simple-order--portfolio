import Customer, { CustomerGridItem } from './Customer'

export default function CustomerList({ customers }: { customers: CustomerGridItem[] }) {
  return (
    <div className="max-w-sm flex flex-col gap-y-4">
      {customers.map((customer, index) => (
        <Customer key={index} name={customer.name} email={customer.email} />
      ))}
    </div>
  )
}
