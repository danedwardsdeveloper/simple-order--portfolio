'use client'
import type { InventoryMerchantSlugGETresponse } from '@/app/api/merchants/[merchantSlug]/get'
import type { OrdersPOSTbody, OrdersPOSTresponse } from '@/app/api/orders/post'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import Spinner from '@/components/Spinner'
import { useNotifications } from '@/components/providers/notifications'
import { useUser } from '@/components/providers/user'
import { userMessages } from '@/library/constants'
import { apiRequest, calculateOrderTotal, checkMinimumSpend, epochDateToAmPm, formatPrice, mergeClasses } from '@/library/utilities/public'
import type { BrowserOrderItem, BrowserSafeCustomerProduct } from '@/types'
import { useRouter } from 'next/navigation'
import { type FormEvent, use, useEffect, useState } from 'react'
import CustomerFacingProductCard from '../components/CustomerFacingProductCard'
import DeliveryDates from './DeliveryDates'

// ToDo: extract CreateOrderForm.tsx
export default function MerchantPage({ params }: { params: Promise<{ merchantSlug: string }> }) {
	const resolvedParams = use(params)
	const merchantSlug = resolvedParams.merchantSlug
	const { user, confirmedMerchants, setOrdersMade, vat } = useUser()
	const router = useRouter()
	const merchantDetails = confirmedMerchants?.find((merchant) => merchant.slug === merchantSlug)

	const { createNotification } = useNotifications()
	const [isLoading, setIsLoading] = useState(true)

	const [products, setProducts] = useState<BrowserSafeCustomerProduct[] | null>(null)
	const [errorMessage, setErrorMessage] = useState('')
	const [availableDeliveryDays, setAvailableDeliveryDays] = useState<Date[] | null>(null)

	// Might need to useRef here as numbers are occasionally getting wiped. However it could just be a development issues with hot reloading
	const [selectedProducts, setSelectedProducts] = useState<Record<string, number>>({})

	const [requestedDeliveryDate, setRequestedDeliveryDate] = useState<Date | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	useEffect(() => {
		async function getData() {
			try {
				setIsLoading(true)

				const { ok, userMessage, availableProducts, availableDeliveryDays } = await apiRequest<InventoryMerchantSlugGETresponse>({
					basePath: '/merchants',
					segment: merchantSlug,
				})

				if (availableDeliveryDays) {
					setAvailableDeliveryDays(availableDeliveryDays)
					setRequestedDeliveryDate(availableDeliveryDays[0])
				}

				if (ok && availableProducts) {
					setProducts(availableProducts)
				} else {
					setErrorMessage("This merchant doesn't have any available products at the moment")
				}

				if (userMessage) setErrorMessage(userMessage)
			} catch {
				setErrorMessage(userMessages.serverError)
			} finally {
				setIsLoading(false)
			}
		}
		getData()
	}, [merchantSlug])

	if (!merchantDetails) return null

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

		if (!requestedDeliveryDate) return null

		const orderItems = Object.keys(selectedProducts)
			.filter((productId) => selectedProducts[Number(productId)] > 0)
			.map((productId) => ({
				productId: Number(productId),
				quantity: selectedProducts[Number(productId)],
			}))

		setIsSubmitting(true)
		setErrorMessage('')

		try {
			const { createdOrder, userMessage } = await apiRequest<OrdersPOSTresponse, OrdersPOSTbody>({
				basePath: '/orders',
				method: 'POST',
				body: { merchantSlug, products: orderItems, requestedDeliveryDate },
			})

			if (createdOrder) {
				createNotification({
					level: 'success',
					title: 'Success',
					message: `Submitted order to ${merchantDetails?.businessName || merchantSlug}`,
				})
				setOrdersMade(
					(prevOrders) => [createdOrder, ...(prevOrders || [])], //
				)
				setSelectedProducts({})
				router.push('/orders')
			}

			if (userMessage) {
				createNotification({
					level: 'error',
					title: 'Error',
					message: userMessage,
				})
			}
		} catch {
			createNotification({
				level: 'error',
				title: 'Error',
				message: userMessages.orderCreationError,
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	if (!user || !merchantDetails) {
		return null
	}

	const { leadTimeDays, cutOffTime } = merchantDetails

	const formReady = !Object.values(selectedProducts).every((quantity) => quantity === 0) && minimumSpendReached && !isSubmitting

	function OrderSummary() {
		return (
			<div className="border-2 border-blue-300 p-3 my-4 rounded-xl max-w-xl">
				<h3 className="mb-2">Order summary</h3>
				<div className="text-right tabular-nums">
					<p>Total with VAT: {formatPrice(totalWithVAT)}</p>
					<p>Total without VAT: {formatPrice(totalWithoutVAT)}</p>
				</div>
			</div>
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
						href: `/orders/${merchantSlug}`,
					},
				]}
				currentPageTitle="New order"
			/>
			<h1>New order</h1>

			<div className="flex flex-col gap-y-4 mb-6 p-3 border-2 border-zinc-200 rounded-xl max-w-xl">
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
			</div>

			{(() => {
				if (isLoading) return <Spinner />

				return (
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

						<OrderSummary />

						{/* Minimum spend progress bar */}
						<div className="max-w-xl my-8">
							<div className="flex justify-between mb-1">
								<div>
									<span className="font-medium">Minimum spend: </span>
									<span>{formatPrice(merchantDetails.minimumSpendPence)} without VAT</span>
								</div>
								{!minimumSpendReached && (
									<span className="text-zinc-600">{formatPrice(merchantDetails.minimumSpendPence - totalWithoutVAT)} under</span>
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
							{errorMessage && (
								<p className="lg:-mx-3 text-red-600 p-3 border-2 border-red-300 bg-red-50 rounded-xl max-w-xl">{errorMessage}</p>
							)}
							<button
								type="submit"
								disabled={Object.values(selectedProducts).every((quantity) => quantity === 0) || isSubmitting || !minimumSpendReached}
								className={mergeClasses(
									'w-full max-w-xl rounded-lg px-3 py-1 font-medium transition-all duration-300 outline-offset-4 focus-visible:outline-orange-400',
									'flex items-center justify-center w-full mt-4 py-2 border-2',
									!formReady
										? 'text-zinc-400 bg-zinc-200 border-zinc-300 cursor-not-allowed'
										: isSubmitting
											? 'bg-blue-600 border-blue-600 text-white cursor-not-allowed'
											: 'bg-blue-600 border-blue-600 hover:bg-blue-500 hover:border-blue-500 active:border-blue-400 active:bg-blue-400 text-white',
								)}
							>
								{isSubmitting ? <Spinner colour="text-white" /> : 'Place order'}
							</button>
						</div>
					</form>
				)
			})()}
		</>
	)
}
