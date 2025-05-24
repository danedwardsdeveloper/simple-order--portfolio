'use client'
import Link from 'next/link'
import type { OrdersPageContentProps } from '../../components/Content'

type Props = Pick<OrdersPageContentProps, 'confirmedMerchants' | 'isDemo'>

// Customer view of a list of merchants the signed-in user is subscribed to
export default function MerchantsList({ confirmedMerchants, isDemo }: Props) {
	if (!confirmedMerchants) {
		return <span>No merchants found</span>
	}

	// ToDo: Don't show 'Place an order' links for merchants with no products
	// ToDo: handle merchants on holiday

	return (
		<div className="bg-blue-50 p-3 mb-6 rounded-xl max-w-xl">
			<h2>Place an order</h2>
			{confirmedMerchants.map((merchant) => {
				const href = `${isDemo && '/demo'}/orders/${merchant.slug}/new`

				return (
					<div key={merchant.slug} className="mt-4 flex gap-x-2 items-end">
						<Link href={href} title={`Place a new order from ${merchant.businessName}`} className="button-secondary">
							{merchant.businessName}
						</Link>
					</div>
				)
			})}
		</div>
	)
}
