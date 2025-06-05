'use client'
import type { InventoryMerchantSlugGETresponse } from '@/app/api/merchants/[merchantSlug]/get'
import type { OrdersPOSTbody, OrdersPOSTresponse } from '@/app/api/orders/post'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { useLoading } from '@/components/providers/loading'
import { useNotifications } from '@/components/providers/notifications'
import { useUser } from '@/components/providers/user'
import { userMessages } from '@/library/constants'
import { apiRequest } from '@/library/utilities/public'
import type { BrowserSafeCustomerProduct } from '@/types'
import { use, useEffect, useState } from 'react'
import type { MerchantSlugParams } from '../page'
import { type CreateOrderFunction, NewOrderPageContent } from './NewOrderPageContent'

export default function NewOrderPage({ params }: MerchantSlugParams) {
	const resolvedParams = use(params)
	const merchantSlug = resolvedParams.merchantSlug

	const { user, confirmedMerchants, setOrdersMade } = useUser()
	const { setDataLoading } = useLoading()
	const { errorNotification } = useNotifications()

	const [products, setProducts] = useState<BrowserSafeCustomerProduct[] | null>(null)
	const [availableDeliveryDays, setAvailableDeliveryDays] = useState<Date[] | null>(null)

	// biome-ignore lint/correctness/useExhaustiveDependencies: <run on mount/params change>
	useEffect(() => {
		async function getData() {
			try {
				setDataLoading(true)

				const { ok, userMessage, availableProducts, availableDeliveryDays } = await apiRequest<InventoryMerchantSlugGETresponse>({
					basePath: '/merchants',
					segment: merchantSlug,
				})

				if (availableDeliveryDays) {
					setAvailableDeliveryDays(availableDeliveryDays)
				}

				if (ok && availableProducts) {
					setProducts(availableProducts)
				} else {
					errorNotification("This merchant doesn't have any available products at the moment")
				}

				if (userMessage) errorNotification(userMessage)
			} catch {
				errorNotification(userMessages.serverError)
			} finally {
				setDataLoading(false)
			}
		}
		getData()
	}, [merchantSlug])

	const createOrder: CreateOrderFunction = async (params: OrdersPOSTbody) => {
		const { createdOrder, userMessage } = await apiRequest<OrdersPOSTresponse, OrdersPOSTbody>({
			basePath: '/orders',
			method: 'POST',
			body: { merchantSlug: params.merchantSlug, products: params.products, requestedDeliveryDate: params.requestedDeliveryDate },
		})

		return { createdOrder, userMessage }
	}

	if (!user) return <UnauthorisedLinks />
	if (!availableDeliveryDays || availableDeliveryDays?.length === 0) {
		return <h1>ToDo: No available delivery days</h1>
	}

	return (
		<NewOrderPageContent
			isDemo={false}
			user={user}
			merchantSlug={merchantSlug}
			availableDeliveryDays={availableDeliveryDays}
			products={products}
			createOrder={createOrder}
			confirmedMerchants={confirmedMerchants}
			setOrdersMade={setOrdersMade}
		/>
	)
}
