'use client'
import type { InventoryMerchantsMerchantSlugGETresponse } from '@/app/api/inventory/merchants/[merchantSlug]/route'
import type { OrdersPOSTresponse } from '@/app/api/orders/route'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import Spinner from '@/components/Spinner'
import { apiPaths } from '@/library/constants'
import logger from '@/library/logger'
import { useNotifications } from '@/providers/notifications'
import { useUser } from '@/providers/user'
import type { BrowserSafeCustomerProduct } from '@/types'
import { useRouter } from 'next/navigation'
import { type FormEvent, use, useEffect, useState } from 'react'
import urlJoin from 'url-join'
import CustomerFacingProductCard from '../components/CustomerFacingProductCard'

export default function MerchantPage({ params }: { params: Promise<{ merchantSlug: string }> }) {
	const resolvedParams = use(params)
	const merchantSlug = resolvedParams.merchantSlug
	const { user, confirmedMerchants } = useUser()
	const router = useRouter()
	const merchantDetails = confirmedMerchants?.find((merchant) => merchant.slug === merchantSlug)
	const { createNotification } = useNotifications()
	const [isLoading, setIsLoading] = useState(true)
	const [products, setProducts] = useState<BrowserSafeCustomerProduct[] | null>(null)
	const [errorMessage, setErrorMessage] = useState('')
	const [selectedProducts, setSelectedProducts] = useState<Record<string, number>>({})
	const [isSubmitting, setIsSubmitting] = useState(false)

	useEffect(() => {
		async function getData() {
			try {
				setIsLoading(true)
				const { availableProducts, message }: InventoryMerchantsMerchantSlugGETresponse = await (
					await fetch(urlJoin(apiPaths.inventory.customerPerspective.base, merchantSlug), { credentials: 'include' })
				).json()

				if (availableProducts) {
					setProducts(availableProducts)
				} else {
					setErrorMessage("This merchant doesn't have any available products at the moment")
				}

				if (!availableProducts) setErrorMessage(message)
			} catch (error) {
				logger.error('unknown error: ', error)
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

		logger.debug('Order items: ', orderItems)

		setIsSubmitting(true)
		setErrorMessage('')

		try {
			const { message }: OrdersPOSTresponse = await (
				await fetch(urlJoin(apiPaths.orders.customerPerspective.base), {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
					body: JSON.stringify({ merchantSlug, products: orderItems }),
				})
			).json()

			if (message === 'success') {
				// Create notification
				// Reset selections
				createNotification({
					level: 'success',
					title: 'Success',
					message: `Submitted order to ${merchantDetails?.businessName || merchantSlug}`,
				})
				// Add order to state
				setSelectedProducts({})
				router.push('/orders')
			} else {
				setErrorMessage(`Failed to create order: ${message || 'Unknown error'}`)
			}
		} catch (error) {
			logger.error('Order submission error:', error)
			setErrorMessage('Failed to submit order. Please try again.')
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
					<ul className="flex flex-col w-full gap-y-4 max-w-xl lg:-mx-3">
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
							className="button-primary  py-2 w-full max-w-xl lg:-mx-3 flex justify-center"
						>
							{isSubmitting ? <Spinner colour="text-white" /> : 'Place order'}
						</button>
					</div>
				</form>
			)}
		</>
	)
}
