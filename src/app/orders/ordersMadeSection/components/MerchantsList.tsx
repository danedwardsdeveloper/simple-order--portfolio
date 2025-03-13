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
		<>
			<h2>Merchants</h2>
			{confirmedMerchants.map((merchant) => (
				<div key={merchant.slug} className="mt-4 flex gap-x-2 items-end">
					<h3>{merchant.businessName}</h3>
					<Link href={`/orders/${merchant.slug}/new`} className="link-primary">
						Place an order
					</Link>
				</div>
			))}
		</>
	)
}
