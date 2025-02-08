import { useAuthorisation } from '@/providers/authorisation'

export default function InviteCustomerMessage() {
  const { clientSafeUser } = useAuthorisation()
  if (!clientSafeUser) return null
  // if (clientSafeUser.merchantDetails?.customersAsMerchant) return null

  return (
    <div className="max-w-prose p-3 my-4 border-2 rounded-xl border-blue-300 ">
      <form action="">
        <label htmlFor="">Invite a customer</label>
        <input type="text" />
      </form>
    </div>
  )
}
