'use client'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { useUser } from '@/providers/user'
import Link from 'next/link'

// Customer view of a list of merchants the signed-in user is subscribed to
export default function MerchantsList() {
	const { user, confirmedMerchants } = useUser()

	if (!user) return <UnauthorisedLinks />

	if (!confirmedMerchants) {
		return <span>No merchants found</span>
	}

	// ToDo: Don't show 'Place an order' links for merchants with no products

	return (
		<div className="bg-blue-50 p-3 mb-6 rounded-xl max-w-xl">
			<h2>Place an order</h2>
			{confirmedMerchants.map((merchant) => (
				<div key={merchant.slug} className="mt-4 flex gap-x-2 items-end">
					<Link href={`/orders/${merchant.slug}/new`} title={`Place a new order from ${merchant.businessName}`} className="link-primary">
						{merchant.businessName}
					</Link>
				</div>
			))}
		</div>
	)
}
