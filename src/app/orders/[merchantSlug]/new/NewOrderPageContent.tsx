'use client'
import type { OrdersPOSTbody, OrdersPOSTresponse } from '@/app/api/orders/post'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import { SubmitButton } from '@/components/Buttons'
import TwoColumnContainer from '@/components/TwoColumnContainer'
import { useNotifications } from '@/components/providers/notifications'
import { useUi } from '@/components/providers/ui'
import { userMessages } from '@/library/constants'
import { calculateOrderTotal, checkMinimumSpend, epochDateToAmPm, formatPrice } from '@/library/utilities/public'
import type { BrowserOrderItem, BrowserSafeCustomerProduct, UserContextType } from '@/types'
import { useRouter } from 'next/navigation'
import { type FormEvent, useEffect, useState } from 'react'
import type { MerchantSlugResolvedParams } from '../page'
import DeliveryDates from './DeliveryDates'
import MinimumMaximumSpend from './MinimumMaximumSpend'
import ProductInput from './ProductInput'

export type CreateOrderFunction = (params: OrdersPOSTbody) => Promise<OrdersPOSTresponse>

export type NewOrderPageContentProps = {
	user: NonNullable<UserContextType['user']>
	createOrder: CreateOrderFunction
	products: BrowserSafeCustomerProduct[] | null
	availableDeliveryDays: Date[]
	isDemo: boolean
} & Pick<UserContextType, 'confirmedMerchants' | 'setOrdersMade'> &
	MerchantSlugResolvedParams

export function NewOrderPageContent({
	merchantSlug,
	confirmedMerchants,
	user,
	products,
	isDemo,
	setOrdersMade,
	createOrder,
	availableDeliveryDays,
}: NewOrderPageContentProps) {
	const router = useRouter()
	const { currency } = useUi()
	const { errorNotification, successNotification } = useNotifications()

	// Use proper type
	// Add validations & feedback
	// Prevent error if maximum order value is exceeded
	const [selectedProducts, setSelectedProducts] = useState<Record<string, number>>({})
	const [requestedDeliveryDate, setRequestedDeliveryDate] = useState<Date | null>(availableDeliveryDays[0])
	const [isSubmitting, setIsSubmitting] = useState(false)

	const merchantDetails = confirmedMerchants?.find((merchant) => merchant.slug === merchantSlug)

	useEffect(() => {
		document.title = `Place an order from ${merchantDetails?.businessName || ''}`
	}, [merchantDetails])

	if (!merchantDetails) return null

	const { cutOffTime } = merchantDetails

	const orderItems: BrowserOrderItem[] =
		products
			?.filter((product) => selectedProducts[product.id] && selectedProducts[product.id] > 0)
			.map((product) => ({
				id: product.id,
				name: product.name,
				description: product.description || '',
				priceInMinorUnitsWithoutVat: product.priceInMinorUnits,
				quantity: selectedProducts[product.id] || 0,
				vat: product.customVat,
			})) || []

	const { totalWithVAT, totalWithoutVAT, maximumOrderValueExceeded } = calculateOrderTotal(orderItems)

	const { minimumSpendReached, percentageTowardsMinimumSpend } = checkMinimumSpend({
		minimumSpend: merchantDetails.minimumSpendPence,
		totalWithoutVAT,
	})

	function handleQuantityChange(productId: number, quantity: string) {
		setSelectedProducts((previous) => ({
			...previous,
			[productId]: quantity,
		}))
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault()
		if (!requestedDeliveryDate || !merchantDetails) return null

		setIsSubmitting(true)

		// Transform quantities to numbers here
		const orderItems = Object.keys(selectedProducts)
			.filter((productId) => selectedProducts[Number(productId)] > 0)
			.map((productId) => ({
				productId: Number(productId),
				quantity: selectedProducts[Number(productId)],
			}))

		try {
			// createOrder is a function provided as a prop that interacts with the database in the real app
			const { createdOrder, userMessage } = await createOrder({ merchantSlug, products: orderItems, requestedDeliveryDate })

			if (createdOrder) {
				successNotification(`Submitted order to ${merchantDetails.businessName}`)

				setOrdersMade(
					(prevOrders) => [createdOrder, ...(prevOrders || [])], //
				)

				router.push(isDemo ? '/demo/orders' : '/orders')

				setSelectedProducts({})
			}

			if (userMessage) errorNotification(userMessage)
		} catch {
			errorNotification(userMessages.orderCreationError)
		} finally {
			setIsSubmitting(false)
		}
	}

	function OrderSummary() {
		// List of products

		return (
			<>
				<h3 className="mb-2">Order summary</h3>

				<div className="space-y-2 tabular-nums">
					<div className="flex justify-between">
						<span>Subtotal</span>
						<span>{formatPrice(totalWithoutVAT, currency)}</span>
					</div>
					<div className="flex justify-between">
						<span>VAT</span>
						<span>{formatPrice(totalWithVAT - totalWithoutVAT, currency)}</span>
					</div>
					<div className="flex justify-between font-semibold border-t pt-2">
						<span>Total without VAT</span>
						<span>{formatPrice(totalWithoutVAT, currency)}</span>
					</div>
					<div className="flex justify-between font-semibold">
						<span>Total with VAT</span>
						<span>{formatPrice(totalWithVAT, currency)}</span>
					</div>
				</div>
			</>
		)
	}

	const formId = 'order-form'

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
				sideColumnClasses="p-4 border-2 border-zinc-200 rounded-xl max-w-xl"
				sideColumn={
					<>
						<p className="flex justify-between mb-4">
							<span className="font-medium">Cut off time </span>
							<span>{epochDateToAmPm(cutOffTime)}</span>
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

						<div className="my-4">
							<MinimumMaximumSpend
								percentageTowardsMinimumSpend={percentageTowardsMinimumSpend}
								merchantDetails={merchantDetails}
								minimumSpendReached={minimumSpendReached}
								maximumOrderValueExceeded={maximumOrderValueExceeded}
								totalWithoutVAT={totalWithoutVAT}
								currency={currency}
							/>
						</div>

						<div className="mt-4 flex flex-col gap-y-4">
							<SubmitButton
								formId={formId}
								isSubmitting={isSubmitting}
								formReady={
									Object.values(selectedProducts).some((quantity) => quantity > 0) && minimumSpendReached && !maximumOrderValueExceeded
								}
								content="Place order"
							/>
						</div>
					</>
				}
				mainColumn={
					<>
						<h1>New order</h1>
						<form id={formId} onSubmit={handleSubmit}>
							<ul className="flex flex-col w-full gap-y-4 max-w-xl">
								{products?.map((product, index) => (
									<ProductInput
										key={product.id}
										product={product}
										zebraStripe={Boolean(index % 2)}
										quantity={selectedProducts[product.id]?.toString() || ''}
										onQuantityChange={(quantity) => handleQuantityChange(product.id, quantity)}
										currency={currency}
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
