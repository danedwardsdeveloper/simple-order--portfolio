'use client'

import { useAuthorisation } from '@/providers/authorisation'

export default function Page() {
	const { clientSafeUser } = useAuthorisation()
	if (!clientSafeUser) return null
	const merchants = clientSafeUser.merchantsAsCustomer?.map((id) => id) || []

	function MerchantsList() {
		if (!merchants || merchants.length === 0) {
			return <span>No merchants found</span>
		}

		return (
			<>
				{merchants.map((merchant) => {
					return (
						<span key={merchant.id} className="block transition-colors duration-300 text-zinc-600 hover:text-blue-400 active:text-blue-500">
							{merchant.businessName}
						</span>
					)
				})}
			</>
		)
	}

	return (
		<>
			<h1>Merchants</h1>
			<div>{<MerchantsList />}</div>
		</>
	)
}
