'use client'
import type { OrdersPOSTbody, OrdersPOSTresponse } from '@/app/api/orders/post'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import { SubmitButton } from '@/components/Buttons'
import TwoColumnContainer from '@/components/TwoColumnContainer'
import { useNotifications } from '@/components/providers/notifications'
import { userMessages } from '@/library/constants'
import { calculateOrderTotal, checkMinimumSpend, epochDateToAmPm, formatPrice } from '@/library/utilities/public'
import type { BrowserOrderItem, BrowserSafeCustomerProduct, UserContextType } from '@/types'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import CustomerFacingProductCard from '../components/CustomerFacingProductCard'
import type { MerchantSlugResolvedParams } from '../page'
import DeliveryDates from './DeliveryDates'

export type CreateOrderFunction = (params: OrdersPOSTbody) => Promise<OrdersPOSTresponse>

type Props = {
	user: NonNullable<UserContextType['user']>
	createOrder: CreateOrderFunction
	products: BrowserSafeCustomerProduct[] | null
	availableDeliveryDays: Date[]
	isDemo: boolean
} & Pick<UserContextType, 'confirmedMerchants' | 'setOrdersMade' | 'vat'> &
	MerchantSlugResolvedParams

export function NewOrderPageContent({
	merchantSlug,
	confirmedMerchants,
	user,
	products,
	vat,
	isDemo,
	setOrdersMade,
	createOrder,
	availableDeliveryDays,
}: Props) {
	const router = useRouter()
	const { errorNotification, successNotification } = useNotifications()

	// Might need to useRef here as input values are occasionally getting wiped. However it could just be a development issues with hot reloading
	const [selectedProducts, setSelectedProducts] = useState<Record<string, number>>({})
	const [requestedDeliveryDate, setRequestedDeliveryDate] = useState<Date | null>(availableDeliveryDays[0])
	const [isSubmitting, setIsSubmitting] = useState(false)

	const merchantDetails = confirmedMerchants?.find((merchant) => merchant.slug === merchantSlug)

	if (!merchantDetails) return null

	const { leadTimeDays, cutOffTime } = merchantDetails

	const orderItems: BrowserOrderItem[] =
		products
			?.filter((product) => selectedProducts[product.id] && selectedProducts[product.id] > 0)
			.map((product) => ({
				id: product.id,
				name: product.name,
				description: product.description || '',
				priceInMinorUnitsWithoutVat: product.priceInMinorUnits,
				quantity: selectedProducts[product.id] || 0,
				vat: product.customVat || vat,
			})) || []

	const { totalWithVAT, totalWithoutVAT } = calculateOrderTotal(orderItems)

	const { minimumSpendReached, percentageTowardsMinimumSpend } = checkMinimumSpend({
		minimumSpend: merchantDetails.minimumSpendPence,
		totalWithoutVAT,
	})

	function handleQuantityChange(productId: number, quantity: number) {
		setSelectedProducts((previous) => ({
			...previous,
			[productId]: quantity,
		}))
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault()
		setIsSubmitting(true)

		if (!requestedDeliveryDate || !merchantDetails) return null

		const orderItems = Object.keys(selectedProducts)
			.filter((productId) => selectedProducts[Number(productId)] > 0)
			.map((productId) => ({
				productId: Number(productId),
				quantity: selectedProducts[Number(productId)],
			}))

		try {
			const { createdOrder, userMessage } = await createOrder({ merchantSlug, products: orderItems, requestedDeliveryDate })

			if (createdOrder) {
				successNotification(`Submitted order to ${merchantDetails.businessName}`)
				setOrdersMade(
					(prevOrders) => [createdOrder, ...(prevOrders || [])], //
				)
				setSelectedProducts({})
				router.push(isDemo ? '/demo/orders' : '/orders')
			}

			if (userMessage) errorNotification(userMessage)
		} catch {
			errorNotification(userMessages.orderCreationError)
		} finally {
			setIsSubmitting(false)
		}
	}

	function OrderSummary() {
		return (
			<>
				<h3 className="mb-2">Order summary</h3>
				<div className="text-right tabular-nums">
					<p>Total with VAT: {formatPrice(totalWithVAT)}</p>
					<p>Total without VAT: {formatPrice(totalWithoutVAT)}</p>
				</div>
			</>
		)
	}

	return (
		<>
			<SignedInBreadCrumbs
				businessName={user.businessName}
				trail={[
					{
						displayName: 'Orders',
						href: '/orders',
					},
					{
						displayName: `${merchantDetails?.businessName || merchantSlug}`,
						href: `${isDemo && '/demo'}/orders/${merchantSlug}`,
					},
				]}
				currentPageTitle="New order"
			/>
			<TwoColumnContainer
				sideColumn={
					<div className="flex flex-col gap-y-4 mb-20 p-4 border-2 border-zinc-200 rounded-xl max-w-xl">
						<p>
							<span className="font-medium">Cut off time: </span>
							<span>{epochDateToAmPm(cutOffTime)}</span>
						</p>
						<p>
							<span className="font-medium">Lead time days: </span>
							<span>{String(leadTimeDays)}</span>
						</p>

						<div>
							<p className="font-medium mb-2">Requested delivery date</p>
							<DeliveryDates
								availableDeliveryDays={availableDeliveryDays}
								selectedDate={requestedDeliveryDate}
								onDateChange={setRequestedDeliveryDate}
							/>
						</div>

						<OrderSummary />

						{/* Minimum spend progress bar */}
						<div className="max-w-xl my-8">
							<div className="flex justify-between mb-1">
								<div>
									<span className="font-medium">Minimum spend: </span>
									<span>{formatPrice(merchantDetails.minimumSpendPence)} without VAT</span>
								</div>
								{!minimumSpendReached && (
									<span className="text-zinc-600">{formatPrice(merchantDetails.minimumSpendPence - totalWithoutVAT)} to go</span>
								)}
							</div>
							<div className="overflow-hidden rounded-full bg-gray-200">
								<div
									style={{
										width: `${percentageTowardsMinimumSpend}%`, //
									}}
									className="h-2 rounded-full transition-all duration-500 bg-blue-600 ease-in-out"
								/>
							</div>
						</div>

						<div className="mt-4 flex flex-col gap-y-4">
							<SubmitButton
								isSubmitting={isSubmitting}
								formReady={Object.values(selectedProducts).some((quantity) => quantity > 0) && minimumSpendReached}
								content="Place order"
							/>
						</div>
					</div>
				}
				mainColumn={
					<>
						<h1>New order</h1>
						<form onSubmit={handleSubmit}>
							<ul className="flex flex-col w-full gap-y-4 max-w-xl">
								{products?.map((product, index) => (
									<CustomerFacingProductCard
										key={product.id}
										product={product}
										zebraStripe={Boolean(index % 2)}
										quantity={selectedProducts[product.id] || 0}
										onQuantityChange={(quantity) => handleQuantityChange(product.id, quantity)}
									/>
								))}
							</ul>
						</form>
					</>
				}
			/>
		</>
	)
}
