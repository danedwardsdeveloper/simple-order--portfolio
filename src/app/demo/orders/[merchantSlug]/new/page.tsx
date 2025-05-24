'use client'
import type { OrdersPOSTbody } from '@/app/api/orders/post'
import { type CreateOrderFunction, NewOrderPageContent } from '@/app/orders/[merchantSlug]/new/Content'
import type { MerchantSlugParams } from '@/app/orders/[merchantSlug]/page'
import { useDemoUser } from '@/components/providers/demo/user'
import { demoInventory, demoOrdersMade } from '@/library/constants/demo'
import { use } from 'react'

export default function DemoNewOrderPage({ params }: MerchantSlugParams) {
	const resolvedParams = use(params)
	const merchantSlug = resolvedParams.merchantSlug

	const { demoUser, setOrdersMade, confirmedMerchants, vat } = useDemoUser()

	const createOrder: CreateOrderFunction = async (_params: OrdersPOSTbody) => {
		// merchantSlug: params.merchantSlug, products: params.products, requestedDeliveryDate: params.requestedDeliveryDate
		const createdOrder = demoOrdersMade[0]

		return { createdOrder }
	}

	const availableDeliveryDays = [new Date()]

	return (
		<NewOrderPageContent
			isDemo={true}
			user={demoUser}
			merchantSlug={merchantSlug}
			availableDeliveryDays={availableDeliveryDays}
			products={demoInventory}
			createOrder={createOrder}
			confirmedMerchants={confirmedMerchants}
			setOrdersMade={setOrdersMade}
			vat={vat}
		/>
	)
}
