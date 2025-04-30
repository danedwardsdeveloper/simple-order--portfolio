'use client'
import type { InventoryMerchantSlugGETresponse } from '@/app/api/inventory/merchants/[merchantSlug]/route'
import type { OrdersPOSTbody, OrdersPOSTresponse } from '@/app/api/orders/route'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import Spinner from '@/components/Spinner'
import { apiPaths, userMessages } from '@/library/constants'
import { apiRequest } from '@/library/utilities/public'
import { useNotifications } from '@/providers/notifications'
import { useUser } from '@/providers/user'
import type { BrowserSafeCustomerProduct } from '@/types'
import { useRouter } from 'next/navigation'
import { type ChangeEvent, type FormEvent, use, useEffect, useState } from 'react'
import urlJoin from 'url-join'
import CustomerFacingProductCard from '../components/CustomerFacingProductCard'

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
				const { availableProducts, userMessage }: InventoryMerchantSlugGETresponse = await (
					await fetch(urlJoin(apiPaths.inventory.customerPerspective.base, merchantSlug), { credentials: 'include' })
				).json()

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

	function handleDateChange(event: ChangeEvent<HTMLInputElement>) {
		setRequestedDeliveryDate(new Date(event.target.value))
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

	if (!user || !merchantSlug) return null

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
			{isLoading ? (
				<Spinner />
			) : (
				<form onSubmit={handleSubmit}>
					<div className="mb-8">
						<label htmlFor="requestedDeliveryDate" className="block mb-1 text-lg font-medium">
							Requested delivery date
						</label>
						<div className="p-2 text-lg bg-slate-50 rounded border-2 border-blue-100 outline-offset-4 focus-visible:outline-orange-400 w-full max-w-sm">
							{requestedDeliveryDate === tomorrow && <span className="mr-2">Tomorrow</span>}
							<input
								type="date"
								className="bg-transparent"
								value={String(requestedDeliveryDate)}
								onChange={handleDateChange}
								min={new Date().toISOString().split('T')[0]} // Minimum date of today
							/>
						</div>
					</div>
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
			)}
		</>
	)
}
