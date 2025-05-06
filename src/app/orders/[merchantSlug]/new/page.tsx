'use client'
import type { InventoryMerchantSlugGETresponse } from '@/app/api/merchants/[merchantSlug]/get'
import type { OrdersPOSTbody, OrdersPOSTresponse } from '@/app/api/orders/post'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import Spinner from '@/components/Spinner'
import { useNotifications } from '@/components/providers/notifications'
import { useUser } from '@/components/providers/user'
import { userMessages } from '@/library/constants'
import { apiRequest, epochDateToAmPm, formatPrice } from '@/library/utilities/public'
import type { BrowserSafeCustomerProduct } from '@/types'
import { useRouter } from 'next/navigation'
import { type FormEvent, use, useEffect, useState } from 'react'
import CustomerFacingProductCard from '../components/CustomerFacingProductCard'
import DeliveryDates from './DeliveryDates'

// ToDo: extract CreateOrderForm.tsx
export default function MerchantPage({ params }: { params: Promise<{ merchantSlug: string }> }) {
	const resolvedParams = use(params)
	const merchantSlug = resolvedParams.merchantSlug
	const { user, confirmedMerchants, setOrdersMade } = useUser()
	const router = useRouter()
	const merchantDetails = confirmedMerchants?.find((merchant) => merchant.slug === merchantSlug)
	const { createNotification } = useNotifications()
	const [isLoading, setIsLoading] = useState(true)
	const [products, setProducts] = useState<BrowserSafeCustomerProduct[] | null>(null)
	const [errorMessage, setErrorMessage] = useState('')
	const [availableDeliveryDays, setAvailableDeliveryDays] = useState<Date[] | null>(null)

	// Might need to useRef here as numbers are occasionally getting wiped. However it could just be a development issues with hot reloading
	const [selectedProducts, setSelectedProducts] = useState<Record<string, number>>({})

	const now = new Date()
	const tomorrow = new Date(now)
	tomorrow.setDate(now.getDate() + 1)

	const [requestedDeliveryDate, setRequestedDeliveryDate] = useState<Date>(tomorrow)

	const [isSubmitting, setIsSubmitting] = useState(false)

	useEffect(() => {
		async function getData() {
			try {
				setIsLoading(true)

				const { userMessage, availableProducts, availableDeliveryDays } = await apiRequest<InventoryMerchantSlugGETresponse>({
					basePath: '/merchants',
					segment: merchantSlug,
				})

				if (availableDeliveryDays) {
					setAvailableDeliveryDays(availableDeliveryDays)
				}

				if (availableProducts) {
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

	function handleQuantityChange(productId: number, quantity: number) {
		setSelectedProducts((previous) => ({
			...previous,
			[productId]: quantity,
		}))
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault()
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
				setOrdersMade((prevOrders) => [createdOrder, ...(prevOrders || [])])
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

	if (!user || !merchantDetails) return null

	const { leadTimeDays, cutOffTime } = merchantDetails

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
					<DeliveryDates availableDeliveryDays={availableDeliveryDays} />
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

						{/* Minimum spend progress bar */}
						<div className="max-w-xl my-6">
							<div className="mb-1">
								<span className="font-medium">Minimum spend: </span>
								<span>{formatPrice(merchantDetails.minimumSpendPence)} without VAT</span>
							</div>
							<div className="overflow-hidden rounded-full bg-gray-200">
								<div style={{ width: '37.5%' }} className="h-2 rounded-full bg-blue-600" />
							</div>
						</div>
						<div className="mt-4 flex flex-col gap-y-4">
							{errorMessage && (
								<p className="lg:-mx-3 text-red-600 p-3 border-2 border-red-300 bg-red-50 rounded-xl max-w-xl">{errorMessage}</p>
							)}

							<button
								type="submit"
								disabled={Object.values(selectedProducts).every((quantity) => quantity === 0) || isSubmitting}
								className="button-primary py-2 w-full max-w-xl flex justify-center"
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
