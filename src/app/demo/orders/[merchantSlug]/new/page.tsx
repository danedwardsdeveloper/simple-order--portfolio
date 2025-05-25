'use client'
import type { OrdersPOSTbody } from '@/app/api/orders/post'
import { type CreateOrderFunction, NewOrderPageContent } from '@/app/orders/[merchantSlug]/new/NewOrderPageContent'
import type { MerchantSlugParams } from '@/app/orders/[merchantSlug]/page'
import { useDemoSettings } from '@/components/providers/demo/settings'
import { useDemoUser } from '@/components/providers/demo/user'
import { useUi } from '@/components/providers/ui'
import { userMessages } from '@/library/constants'
import { demoInventory, demoMerchant, floristInventory } from '@/library/constants/demo'
import { isProduction } from '@/library/environment/publicVariables'
import { getAvailableDeliveryDays } from '@/library/utilities/public'
import type { BrowserOrderItem, OrderMade } from '@/types'
import { useRouter } from 'next/navigation'
import { use, useEffect } from 'react'

export default function DemoNewOrderPage({ params }: MerchantSlugParams) {
	const resolvedParams = use(params)
	const merchantSlug = resolvedParams.merchantSlug

	const { customer, ordersMade, setOrdersMade, setOrdersReceived, confirmedMerchants, vat, inventory } = useDemoUser()
	const { merchantMode } = useUi()
	const { acceptedWeekDayIndices, holidays } = useDemoSettings()
	const router = useRouter()

	useEffect(() => {
		if (merchantMode && isProduction) {
			router.push('/demo/dashboard')
		}
	}, [merchantMode, router])

	// Major ToDo: use the right inventory!
	// Actually this might be a premature optimisation...

	const createOrder: CreateOrderFunction = async (props: OrdersPOSTbody) => {
		if (!inventory) return { userMessage: userMessages.serverError }

		const orderId = (ordersMade?.length || 0) + 1
		const orderItems: BrowserOrderItem[] = props.products.map((selectedProduct) => {
			const inventoryProduct = inventory.find((item) => item.id === selectedProduct.productId)

			if (!inventoryProduct) {
				throw new Error(`Product with id ${selectedProduct.productId} not found in inventory`)
			}

			return {
				id: inventoryProduct.id,
				name: inventoryProduct.name,
				description: inventoryProduct.description,
				orderId: orderId, // You'll need to provide this
				productId: selectedProduct.productId,
				quantity: selectedProduct.quantity,
				priceInMinorUnitsWithoutVat: inventoryProduct.priceInMinorUnits,
				vat: inventoryProduct.customVat || vat,
			}
		})

		const createdOrder: OrderMade = {
			id: orderId,
			statusName: 'Pending',
			businessName: confirmedMerchants?.find((merchant) => merchant.slug === props.merchantSlug)?.businessName || '',
			requestedDeliveryDate: props.requestedDeliveryDate,
			products: orderItems,
			createdAt: new Date(),
			updatedAt: new Date(),
		}

		if (props.merchantSlug === demoMerchant.slug) {
			setOrdersReceived((prev) => [createdOrder, ...(prev ?? [])])
		}

		return { createdOrder }
	}

	const availableDeliveryDays = getAvailableDeliveryDays({
		acceptedWeekDayIndices,
		holidays,
		lookAheadDays: 14,
		cutOffTime: demoMerchant.cutOffTime,
		leadTimeDays: demoMerchant.leadTimeDays,
	})

	if (!availableDeliveryDays || availableDeliveryDays.length === 0) {
		// ToDo...
		return <h1>No available delivery days</h1>
	}

	const products = merchantSlug === demoMerchant.slug ? demoInventory : floristInventory

	return (
		<NewOrderPageContent
			isDemo={true}
			user={customer}
			merchantSlug={merchantSlug}
			availableDeliveryDays={availableDeliveryDays}
			products={products}
			createOrder={createOrder}
			confirmedMerchants={confirmedMerchants}
			setOrdersMade={setOrdersMade}
			vat={vat}
		/>
	)
}
